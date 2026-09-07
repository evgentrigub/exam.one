// Creates disposable databases only in the dedicated stage 2.11 verification container.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const container = 'exam-one-pack-check'
const root = fileURLToPath(new URL('../libraries/database/prisma/migrations/', import.meta.url))
const migrations = readdirSync(root).filter(name => /^\d/.test(name)).sort()
const sql = name => readFileSync(`${root}/${name}/migration.sql`, 'utf8')
const run = (database, input) => execFileSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', database, '-v', 'ON_ERROR_STOP=1'], { input, encoding: 'utf8' })
const suffix = Date.now()
const fresh = `pack_fresh_${suffix}`
const upgrade = `pack_upgrade_${suffix}`
run('postgres', `CREATE DATABASE ${fresh}; CREATE DATABASE ${upgrade};`)
run(fresh, migrations.map(sql).join('\n'))
const boundary = '20260901120000_exam_pack_id'
run(upgrade, migrations.filter(name => name < boundary).map(sql).join('\n'))
run(upgrade, `
INSERT INTO "User" (id,email,name,"updatedAt") VALUES ('upgrade-user','upgrade@example.test','Upgrade',now());
INSERT INTO "Setting" (id,"userId","examLevel","updatedAt") VALUES ('upgrade-setting','upgrade-user','C1',now());
INSERT INTO "Exercise" (id,"userId",skill,level,source,visibility,"externalId",payload) VALUES
('old-c1','upgrade-user','WRITING','C1','generated','PRACTICE','old-c1-writing','{"id":"old-c1-writing","difficulty":"C1","title":"Historical C1"}'),
('old-a2','upgrade-user','READING','A2','generated','PRACTICE','old-a2-reading','{"id":"old-a2-reading","difficulty":"A2"}');
INSERT INTO "Attempt" (id,"userId","exerciseId",skill,answers) VALUES ('old-attempt','upgrade-user','old-c1','WRITING','{"answer":"Preserved response"}'), ('ambiguous-attempt','upgrade-user',NULL,'WRITING','{}');
INSERT INTO "Result" (id,"attemptId",score,"maxScore",percentage,review) VALUES ('old-result','old-attempt',12,25,48,'{"summary":"Historical feedback"}');
INSERT INTO "Draft" (id,"userId",skill,"topicId",payload,"updatedAt") VALUES ('old-draft','upgrade-user','WRITING','old-c1-writing','{"content":"Keep my draft"}',now());
`)
run(upgrade, migrations.filter(name => name >= boundary).map(sql).join('\n'))
run(upgrade, `DO $$ BEGIN
 IF (SELECT "packId" FROM "Exercise" WHERE id='old-c1') <> 'goethe-de-c1' THEN RAISE EXCEPTION 'C1 exercise relabeled'; END IF;
 IF (SELECT "packId" FROM "Attempt" WHERE id='old-attempt') <> 'goethe-de-c1' THEN RAISE EXCEPTION 'C1 history relabeled'; END IF;
 IF (SELECT "packId" FROM "Draft" WHERE id='old-draft') <> 'goethe-de-c1' THEN RAISE EXCEPTION 'C1 draft relabeled'; END IF;
 IF (SELECT "packId" FROM "Attempt" WHERE id='ambiguous-attempt') <> 'legacy-history' THEN RAISE EXCEPTION 'Unknown history guessed'; END IF;
 IF (SELECT score FROM "Result" WHERE id='old-result') <> 12 THEN RAISE EXCEPTION 'Historical score changed'; END IF;
 IF (SELECT "snapshot"->'payload'->>'title' FROM "Attempt" WHERE id='old-attempt') <> 'Historical C1' THEN RAISE EXCEPTION 'Snapshot lost'; END IF;
END $$;`)
console.log('Fresh and representative upgrade rehearsals passed', { fresh, upgrade, migrations: migrations.length })
