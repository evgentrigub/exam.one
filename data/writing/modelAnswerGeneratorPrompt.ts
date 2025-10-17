import { dataAnswerRuleC1Part1, dataAnswerRuleC1Part2 } from "./dataToGenerateTopicsC1"

export const generateModelAnswerC1Part1 = (topicTask: string, topicId: string) => {
    return `
        Ты — опытный составитель экзаменов Goethe-Institut (уровень C1), работаешь строго по модульному формату 2024. 
        Ранее ты сгенерировал следюущее задание: ${topicTask}
        ТВОЯ ЗАДАЧА: Сгенерируй пример идеального ответа на задание выше.
        Детальное описание формата ответа Teil 1: ${dataAnswerRuleC1Part1}
        
        ФОРМАТ ВЫВОДА (строго): 
        Сгенерированный ответ переделай под модель данных на JavaScript, которая представлена ниже. Не меняй поля id и topicId.
        export interface ModelAnswer {
            id: string
            topicId: ${topicId} // не меняй это поле
            content: string 
            wordCount: number 
            highlights?: { 
                greeting?: string 
                mainPoints?: string[] 
                closing?: string 
                keyPhrases?: string[] 
            } 
        }

        topicId - id задания, к которому ты составляешь ответ 
        content - сгенерированный "идеальный" ответ 
        highlights - здесь укажи основные моменты почему твой сгенерированный ответ является идеальным

        Важное: ответы должны быть реалистичными и современными. 
    `
}

export const generateModelAnswerC1Part2 = (topicTask: string, topicId: string) => {
    return `
        Ты — опытный составитель экзаменов Goethe-Institut (уровень C1), работаешь строго по модульному формату 2024. 
        Ранее ты сгенерировал следюущее задание: ${topicTask}
        ТВОЯ ЗАДАЧА: Сгенерируй пример идеального ответа на задание выше.
        Детальное описание формата ответа Teil 2: ${dataAnswerRuleC1Part2}
        
        ФОРМАТ ВЫВОДА (строго): 
        Сгенерированный ответ переделай под модель данных на JavaScript, которая представлена ниже. Не меняй поля id и topicId.
        export interface ModelAnswer {
            id: string
            topicId: ${topicId} // не меняй это поле
            content: string 
            wordCount: number 
            highlights?: { 
                greeting?: string 
                mainPoints?: string[] 
                closing?: string 
                keyPhrases?: string[] 
            } 
        }

        topicId - id задания, к которому ты составляешь ответ 
        content - сгенерированный "идеальный" ответ 
        highlights - здесь укажи основные моменты почему твой сгенерированный ответ является идеальным

        Важное: ответы должны быть реалистичными и современными. 
    `
}