export const generateModelAnswerC1Part1 = (topicTask: string, topicId: string) => {
  return `
        Ты — опытный составитель экзаменов Goethe-Institut (уровень C1), работаешь строго по модульному формату 2024. 
        Ранее ты сгенерировал следюущее задание: ${topicTask}
        ТВОЯ ЗАДАЧА: Сгенерируй пример идеального ответа на задание выше.
        Детальное описание формата ответа Teil 1: ${dataAnswerRuleC1Part1}
        
        ФОРМАТ ВЫВОДА (строго): 
        Сгенерированный ответ выводи в формате JSON, который представлен ниже. Не меняй поле topicId.
        {
            "topicId": "${topicId}",
            "content": "сгенерированный ответ",
            "wordCount": 120,
            "highlights": {
                "greeting": "приветствие в начале ответа",
                "mainPoints": ["основные моменты в ответе"],
                "closing": "закрытие в конце ответа",
                "keyPhrases": ["ключевые фразы в ответе"]
            }
        }

        Поля JSON:
        topicId - id задания (не меняй)
        content - сгенерированный "идеальный" ответ (строка)
        wordCount - количество слов в content (целое число, не строка)
        highlights - объяснение почему ответ идеален

        Важное: ответы должны быть реалистичными и современными. Выводи ТОЛЬКО JSON, без пояснений до и после.
    `
}

export const generateModelAnswerC1Part2 = (topicTask: string, topicId: string) => {
  return `
        Ты — опытный составитель экзаменов Goethe-Institut (уровень C1), работаешь строго по модульному формату 2024. 
        Ранее ты сгенерировал следюущее задание: ${topicTask}
        ТВОЯ ЗАДАЧА: Сгенерируй пример идеального ответа на задание выше.
        Детальное описание формата ответа Teil 2: ${dataAnswerRuleC1Part2}
        
        ФОРМАТ ВЫВОДА (строго): 
        Сгенерированный ответ выводи в формате JSON, который представлен ниже. Не меняй поле topicId.
        {
            "topicId": "${topicId}",
            "content": "сгенерированный ответ",
            "wordCount": 120,
            "highlights": {
                "greeting": "приветствие в начале ответа",
                "mainPoints": ["основные моменты в ответе"],
                "closing": "закрытие в конце ответа",
                "keyPhrases": ["ключевые фразы в ответе"]
            }
        }

        Поля JSON:
        topicId - id задания (не меняй)
        content - сгенерированный "идеальный" ответ (строка)
        wordCount - количество слов в content (целое число, не строка)
        highlights - объяснение почему ответ идеален

        Важное: ответы должны быть реалистичными и современными. Выводи ТОЛЬКО JSON, без пояснений до и после.
    `
}

const dataAnswerRuleC1Part1 = `
Beschreibung der Prüfung
Schreiben: Teil 1
Sie schreiben einen Forumsbeitrag zu einem aktuellen Thema.
Hierfür erhalten Sie eine Überschrift, die das Thema umschreibt und vier Inhaltspunkte, die Sie bearbeiten müssen. Sie äußern zu einem Diskussionsthema Ihre Meinung, nennen Gründe, berichten von (Ihren) Erfahrungen, zählen Vor- und Nachteile auf, zeigen Alternativen auf und machen Vorschläge.
Vergessen Sie nicht, eine Einleitung und einen Schluss zu schreiben.
Sie schreiben Ihren Text in neutraler Sprache. Das bedeutet: Sie schreiben nicht so persönlich wie in einer E-Mail an einen Freund.
Der Text sollte ca. 230 Wörter lang sein.
Lösungsstrategie: Schritt für Schritt
Schritt: Lesen Sie die Überschrift, um das Thema zu verstehen.
Schritt: Lesen Sie die Inhaltspunkte und unterstreichen Sie wichtige Wörter.
Schritt: Lesen Sie auch die formalen Angaben am Ende des Teils 2.
Schritt: Notieren Sie sich Stichpunkte zu den Inhaltspunkten.
Schritt: Rufen Sie sich passende Redemittel für Einleitung, Hauptteil und Schluss in Erinnerung.
Schritt: Schreiben Sie mithilfe Ihrer Stichpunkte und Redemittel den Text direkt auf den Antwortbogen. Achten Sie dabei auf eine gute Verknüpfung von Sätzen und Satzteilen.
Schritt: Lesen Sie den Text noch einmal durch und korrigieren Sie ihn.
Die Checkliste hilft Ihnen bei der Korrektur des Textes:
Habe ich alle vier Inhaltspunkte behandelt?
Entsprechen die Anrede (wenn erforderlich) und der Text der Textsorte?
Habe ich die Groß- und Kleinschreibung beachtet?
Sind die Verb- und Adjektivformen korrekt?
Habe ich die Sätze und Abschnitte korrekt miteinander verbunden?
`

const dataAnswerRuleC1Part2 = `
Beschreibung der Prüfung
Schreiben: Teil 2
Sie schreiben eine Nachricht an Kolleginnen/Kollegen, Vorgesetzte, Lehrende, Tutorinnen/Tutoren u. Ä.
Hierfür erhalten Sie eine kurze Kontextbeschreibung und vier Inhaltspunkte. Sie bitten höflich um etwas, benennen ein Problem, klären Missverständnisse auf und machen Vorschläge.
Sie verfassen Ihren Text im (halb)formellen Register. Vergessen Sie nicht die passende Anrede und Grußformel.
Der Text sollte ca. 120 Wörter lang sein.
Lösungsstrategie: Schritt für Schritt
Schritt: Lesen Sie den Einleitungstext, um die Situation bzw. den Anlass zu verstehen.
Schritt: Lesen Sie die Inhaltspunkte und unterstreichen Sie wichtige Wörter.
Schritt: Lesen Sie auch die formalen Angaben am Ende des Teils 2.
Schritt: Notieren Sie Stichpunkte zu den Inhaltspunkten.
Schritt: Notieren Sie Redemittel zur Anrede, Einleitung, zum Hauptteil und zur Grußformel.
Schritt: Schreiben Sie mithilfe Ihrer Stichpunkte und Redemittel den Text direkt auf den Antwortbogen. Formulieren Sie zu jedem Inhaltspunkt mindestens zwei Sätze.
Schreiben Sie Ihren ausformulierten Text nicht auf Notizpapier. Die Zeit in der Prüfung ist knapp. Verwenden Sie gleich den passenden Antwortbogen.
Falls Ihnen diese Aufgabe besser liegt, können Sie auch mit diesem Prüfungsteil beginnen. Die 75 Minuten Prüfungszeit können Sie selbst einteilen.
`
