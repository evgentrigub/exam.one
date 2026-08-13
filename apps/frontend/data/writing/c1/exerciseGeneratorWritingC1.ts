export const generateTopicsC1Part1 = () => {
  return `
    Ты — опытный составитель экзаменов Goethe-Institut (уровень C1), работаешь строго по модульному формату 2024. 
    Задача: Сгенерируй 3 самостоятельных задания для части Schreiben C1: Teil 1 (форум). 
    ВСЕ инструкции к заданиям выдай на НЕМЕЦКОМ. Никаких ответов-образцов — только условия задач. 
    ОБЩИЕ ТРЕБОВАНИЯ: 
    • Формат и стиль соответствуют Goethe C1. 
    • Для каждого задания обязательно дай ровно 4 Inhalts­punkte, которые нужно раскрыть. 
    • Темы выбирай СЛУЧАЙНО из списка тематик ниже. 
    • В конце каждого задания явно укажи рекомендуемый объём слов. 
    
    СПИСОК ТИПИЧЕСКИХ ТЕМАТИК (используй случайно и варьируй формулировки): 
    Bildung und Studium; Arbeit und Büroalltag; Digitalisierung/Soziale Medien; Umwelt und Nachhaltigkeit; 
    Gesundheit und Gesellschaft; Mobilität und Verkehr; Stadtleben und Wohnen; Kultur und Freizeit; 
    Wissenschaft und Technik; Konsum und Wirtschaft. 
    
    TEIL 1 — FORUMSBEITRAG (C1, ca. 230 Wörter) 
    • Текст задания: написать пост на форум по обсуждению актуальных тем (нейтральный стиль). 
    • Дай заголовок темы + 1–2 вводные строки (контекст). 
    • Приведи 4 Inhalts­punkte, покрывающие функции C1: erklären/erläutern, argumentieren (mit Beispiel), Gründe/Pro & Contra nennen, Alternative/Empfehlung darstellen. Эти пункты ученик должен раскрыть в своём ответе. Пункты сформулированы, как задания и структура пунктов одинаковая. 
    • Явно укажи: „Schreiben Sie circa 230 Wörter.” 
    • Не добавляй никаких подсказок шаблонов или планов ответа, только условие. 
    
    ФОРМАТ ВЫВОДА (строго): 
    Сгенерированные создания переделай под модель данных на JavaScript, которая представлена ниже. 
    ВАЖНО: Для Teil 1 (форум) используй topicType: 'post' или 'article'.
    export interface WritingTopic { 
        id: string 
        title: string 
        topicType: 'report' | 'review' | 'proposal' | 'article' | 'note' | 'form' | 'email' | 'letter' | 'essay' | 'postcard' | 'post'
        difficulty: 'C1' 
        testingPart: 1 // 1 - Teil 1, 2 - Teil 2
        estimatedTime: number // in minutes 
        wordCount: { min: number max: number } 
        category: string[] // categories of the topic
        createdAt: string // date of creation
        description: string // What type of text they should write 
        task: string // The actual writing prompt/task 
        requirements: string[] // Specific requirements (format, length, etc.) 
    } 

    Важное: Темы и пункты должны быть реалистичными и современными. 
    Не генерируй решения или текст писем — только экзаменационные условия. 
    Ниже ты видишь примеры заданий Teil 1 из книги по подготовке экзамену Goethe C1. Используй их для лучшего понимания контекста.
    Примеры заданий: ${dataC1Part1Topics.join('\n')}
    `
}

export const generateTopicsC1Part2 = () => {
  return `
      Ты — опытный составитель экзаменов Goethe-Institut (уровень C1), работаешь строго по модульному формату 2024. 
      Задача: Сгенерируй 3 самостоятельных задания для части Schreiben C1: Teil 2 (E-Mail). 
      ВСЕ инструкции к заданиям выдай на НЕМЕЦКОМ. Никаких ответов-образцов — только условия задач. 
      ОБЩИЕ ТРЕБОВАНИЯ: 
      • Формат и стиль соответствуют Goethe C1. 
      • Для каждого задания обязательно дай ровно 4 Inhalts­punkte, которые нужно раскрыть. 
      • Темы выбирай СЛУЧАЙНО из списка тематик ниже. 
      • В конце каждого задания явно укажи рекомендуемый объём слов. 
      
      СПИСОК ТИПИЧЕСКИХ ТЕМАТИК (используй случайно и варьируй формулировки): 
      Bildung und Studium; Arbeit und Büroalltag; Digitalisierung/Soziale Medien; Umwelt und Nachhaltigkeit; 
      Gesundheit und Gesellschaft; Mobilität und Verkehr; Stadtleben und Wohnen; Kultur und Freizeit; 
      Wissenschaft und Technik; Konsum und Wirtschaft. 
      
      TEIL 2 — (HALB-)FORMELLE E-MAIL (C1, ca. 120 Wörter) 
      • Адресат (случайно и уместно): Kollegin/Kollege, Vorgesetzte(r), Lehrende(r)/Tutor(in), Verwaltung/Service. 
      • Ситуация: задай конкретный служебно-учебный контекст. 
      • 4 Inhalts­punkte должны реализовывать типичные функции C1 для Teil 2: höflich Verständnis zeigen / um etwas bitten ODER auf ein Problem aufmerksam machen, Missverständnis klären / Bedingungen beschreiben, Vorschlag/Kompromiss machen. 
      • Явно потребуй: passende Anrede und Grußformel, neutral-bis-formell Register. 
      • Укажи: „Schreiben Sie circa 120 Wörter.” 
      
      ФОРМАТ ВЫВОДА (строго): 
      Сгенерированные создания переделай под модель данных на JavaScript, которая представлена ниже. 
      ВАЖНО: Для Teil 2 (E-Mail) используй topicType: 'email'.
      export interface WritingTopic { 
          id: string 
          title: string 
          topicType: 'report' | 'review' | 'proposal' | 'article' | 'note' | 'form' | 'email' | 'letter' | 'essay' | 'postcard' | 'post'
          difficulty: 'C1' 
          testingPart: 2 // 1 - Teil 1, 2 - Teil 2
          estimatedTime: number // in minutes 
          wordCount: { min: number max: number } 
          category: string[] // categories of the topic
          createdAt: string // date of creation
          description: string // What type of text they should write 
          task: string // The actual writing prompt/task 
          requirements: string[] // Specific requirements (format, length, etc.) 
      } 

      Важное: Темы и пункты должны быть реалистичными и современными. 
      Не генерируй решения или текст писем — только экзаменационные условия. 
      Ниже ты видишь примеры заданий Teil 2 из книги по подготовке экзамену Goethe C1. Используй их для лучшего понимания контекста.
      Примеры заданий Teil 2: ${dataC1Part2Topics.join('\n')}
      `
}

export const dataC1Part1Topics = [
  `
Teil 1
Für das Internetforum Neue Arbeitsmethoden verfassen Sie einen Diskussionsbeitrag zu diesem Thema:
Home-Office oder Arbeitsplatz im Büro einer Firma?
Wo lässt es sich besser arbeiten?
Erklären Sie, unter welchen Bedingungen sich ein Arbeitgeber für Home-Office aussprechen sollte.
Erläutern Sie mögliche Argumente des Arbeitgebers gegen Home-Office.
Nennen Sie Vorteile für Arbeiten im Büro einer Firma.
Nennen Sie Beispiele für Berufsgruppen, für die Home-Office nicht möglich ist.
Schreiben Sie circa 230 Wörter.
vorgeschlagene Arbeitszeit: 25 Minuten`,
  `
Teil 1
Für das Internetforum Neue Arbeitsmethoden verfassen Sie einen Diskussionsbeitrag zu diesem Thema:
Work-Life-Balance: Wie schaffen wir ein ausgewogenes Verhältnis zwischen Berufsleben und Privatleben?
Erklären Sie, welche Folgen zu hoher Arbeitsdruck haben kann.
Nennen Sie Vorteile einer gelungenen Work-Life-Balance.
Erläutern Sie, was Arbeitgeber für eine gute Work-Life-Balance tun können.
Nennen Sie andere Möglichkeiten für einen ausgewogenen Lebensstil.
Schreiben Sie circa 230 Wörter.
vorgeschlagene Arbeitszeit: 25 Minuten
`,
  `
Teil 1
Für das Internetforum Digital leben verfassen Sie einen Diskussionsbeitrag zu diesem Thema:
Netzkriminalität und Cybermobbing
Sollte das Internet stärker reguliert werden?
Erklären Sie, welche Folgen das Internet als völlig rechtsfreier Raum haben könnte.
Nennen Sie Beispiele, die einer rechtlichen Regulierung unterliegen sollten.
Erläutern Sie, wie sich eine zu starke Regulierung auf die Meinungsfreiheit auswirken könnte.
Nennen Sie Alternativen, wie man Menschen vor den Gefahren, die durch das Internet entstehen, schützen könnte.
Schreiben Sie circa 230 Wörter.
vorgeschlagene Arbeitszeit: 25 Minuten
`,
  `
Teil 1

Für das Internetforum Bessere Integration verfassen Sie einen Diskussionsbeitrag zu diesem Thema:
Soll Englisch zweite Behördensprache in Deutschland werden?
Erklären Sie, welche Kriterien Angestellte in Behörden mit Publikumsverkehr erfüllen sollten.
Argumentieren Sie anhand von Beispielen für oder gegen Englisch als zweite Behördensprache.
Erläutern Sie, wie wichtig es für die Integration ist, die Landessprache zu beherrschen.
Nennen Sie Möglichkeiten, eine zweite Fremdsprache zu lernen.
Schreiben Sie circa 230 Wörter.
vorgeschlagene Arbeitszeit: 25 Minuten
`,
]

export const dataC1Part2Topics = [
  `
Teil 2
Sie und Ihr Teamleiter Herr Lehmann sollen in der nächsten Woche gemeinsam ein neues Produkt präsentieren. 
Ihr Teamleiter sollte Ihnen schon vor einer Woche eine Grobplanung für die Präsentation schicken, die Sie bisher – trotz wiederholter Nachfrage – noch nicht erhalten haben. Schreiben Sie eine E-Mail an Ihren Teamleiter.
Eröffnen Sie Ihr Schreiben höflich, indem Sie Verständnis für die Verzögerung zeigen.
Nennen Sie Probleme, die durch sein Verhalten entstehen können.
Beschreiben Sie mögliche Konsequenzen, sollte die Präsentation nicht erfolgreich sein.
Machen Sie einen Vorschlag für das weitere Vorgehen.
Schreiben Sie circa 120 Wörter.
Für Teil 1 und Teil 2 gilt:
Bei der Bewertung wird darauf geachtet, wie genau die Inhaltspunkte bearbeitet sind, wie korrekt der Text ist und wie gut die Sätze und Abschnitte sprachlich miteinander verknüpft sind.
`,
  `
Teil 2
In Ihrer Firma wurde ein neuer Kollege eingestellt, der jetzt mit Ihnen in Ihrem Büro arbeitet. Durch den zusätzlichen Arbeitsplatz hat sich jedoch in Ihrem Büro ein Platzproblem ergeben. Verfassen Sie ein Schreiben an Ihre Vorgesetzte, Frau Kaur, in dem Sie sie auf das Problem aufmerksam machen.
Eröffnen Sie Ihr Schreiben, indem Sie Ihre Freude darüber äußern, dass Ihr Team jetzt einen neuen Kollegen hat.
Nennen Sie das Projekt, an dem Sie zurzeit arbeiten.
Beschreiben Sie das Platzproblem, das sich durch den neuen Arbeitsplatz des Kollegen im Raum ergeben hat.
Schlagen Sie eine Lösung für das Platzproblem vor.
Schreiben Sie circa 120 Wörter.
Für Teil 1 und Teil 2 gilt:
Bei der Bewertung wird darauf geachtet, wie genau die Inhaltspunkte bearbeitet sind, wie korrekt der Text ist und wie gut die Sätze und Abschnitte sprachlich miteinander verknüpft sind.
`,
  `
Teil 2
Ihr Büro befindet sich in einem großen Gebäude, in dem mehrere Firmen Räume angemietet haben. Im Büro unter Ihnen bellt unaufhörlich ein junger Hund. Obwohl Sie den Hundebesitzer schon mehrmals darauf angesprochen haben, hat sich bis jetzt nichts geändert. Verfassen Sie ein Schreiben an den Besitzer, Herrn Jung, in dem Sie ihn auf das Problem aufmerksam machen.
Eröffnen Sie Ihr Schreiben höflich, indem Sie Verständnis für die Unterbringung des Hundes in den Büroräumen zeigen.
Nennen Sie die Probleme, die durch die ständige Ruhestörung entstanden sind.
Beschreiben Sie, welche Konsequenzen es geben wird, falls das Problem nicht gelöst wird.
Machen Sie einen Vorschlag, wie die Ruhestörung verhindert werden kann.
Schreiben Sie circa 120 Wörter.
Für Teil 1 und Teil 2 gilt:
Bei der Bewertung wird darauf geachtet, wie genau die Inhaltspunkte bearbeitet sind, wie korrekt der Text ist und wie gut die Sätze und Abschnitte sprachlich miteinander verknüpft sind.
`,
  `
Teil 2
Sie sind letzte Woche zum ersten Mal in Ihrer langjährigen Betriebszugehörigkeit zu spät gekommen. Daraufhin erhielten Sie von Ihrer Vorgesetzten eine E-Mail mit dem Hinweis darauf, dieses Verhalten in Zukunft zu unterlassen. Schreiben Sie eine Beschwerde an Ihre Vorgesetzte, Frau Marek.
Eröffnen Sie Ihr Schreiben, indem Sie Verständnis für die Wichtigkeit der Einhaltung der Arbeitszeit zeigen.
Nennen Sie die Ursache Ihres Zuspätkommens.
Äußern Sie Ihren Unmut über die E-Mail Ihrer Vorgesetzten.
Machen Sie einen Vorschlag für den Umgang mit Verspätungen.
Schreiben Sie circa 120 Wörter.
Für Teil 1 und Teil 2 gilt:
Bei der Bewertung wird darauf geachtet, wie genau die Inhaltspunkte bearbeitet sind, wie korrekt der Text ist und wie gut die Sätze und Abschnitte sprachlich miteinander verknüpft sind.
`,
]
