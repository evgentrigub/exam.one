# Model Answer Dynamic Generation Implementation

## Overview
This implementation enables dynamic generation of model answers for C1 Part 1 and Part 2 writing topics using AI, with automatic localStorage persistence.

## Architecture

### 1. Server API Endpoint
**File**: `/server/api/generate-model-answer.post.ts`
- Handles AI requests to generate model answers
- Uses OpenAI API (requires `NUXT_OPENAI_API_KEY`)
- Extracts JSON from AI response
- Follows same pattern as review generation

### 2. Composable
**File**: `/composables/useModelAnswer.ts`
- Manages model answer generation lifecycle
- Handles localStorage persistence (key: `model-answers`)
- Tracks generation status: `idle`, `pending`, `ready`, `error`
- Generates UUIDs for new model answers
- Reactive updates via `modelAnswerVersion`

#### Key Functions:
- `getModelAnswer(topicId)` - Retrieve stored model answer
- `isGenerating(topicId)` - Check if generation is in progress
- `hasModelAnswer(topicId)` - Check if model answer exists
- `generateModelAnswer(topic)` - Trigger AI generation
- `clearModelAnswer(topicId)` - Remove stored answer

### 3. Component Updates
**File**: `/components/writing/ModelAnswerCard.vue`
- Auto-generates model answer on mount (for C1 Part 1 & 2)
- Shows loading state during generation
- Displays "Generate" button as fallback
- Uses existing i18n translations

#### States:
1. **Loading** - Shows spinner while generating
2. **Has Answer** - Displays model answer content
3. **Can Generate** - Shows generate button (C1 Part 1/2 only)
4. **No Example** - For unsupported topics (A2, etc.)

### 4. Data Structure Changes
**File**: `/data/writing/modelAnswers.ts`
- Removed hardcoded `modelAnswersA2` and `modelAnswersС1` arrays
- Kept `ModelAnswer` interface
- Removed `getModelAnswer()` helper (moved to composable)

### 5. Translations Added
**Files**: `/i18n/locales/en.json`, `/i18n/locales/de.json`

New keys:
```json
{
  "writing.modelAnswer": {
    "generating": "Generating model answer..." / "Musterantwort wird generiert...",
    "canGenerate": "A model answer can be generated..." / "Eine Musterantwort kann...",
    "generateButton": "Generate Model Answer" / "Musterantwort generieren"
  }
}
```

## Data Flow

```
1. User views writing topic (C1 Part 1/2)
   ↓
2. ModelAnswerCard mounts
   ↓
3. Check localStorage for existing answer
   ↓
4. If not found → Auto-generate
   ↓
5. composable calls /api/generate-model-answer
   ↓
6. Server sends prompt to OpenAI
   ↓
7. Response parsed and saved with UUID
   ↓
8. localStorage updated
   ↓
9. Component reactively displays answer
```

## Storage Format

### localStorage Key: `model-answers`

```typescript
{
  "c1-topic-1": {
    "topicId": "c1-topic-1",
    "status": "ready",
    "prompt": "...",
    "requestedAt": "2025-10-17T...",
    "completedAt": "2025-10-17T...",
    "modelAnswer": {
      "id": "550e8400-e29b-41d4-a716-446655440000", // UUID
      "topicId": "c1-topic-1",
      "content": "...",
      "wordCount": 230,
      "highlights": {
        "greeting": "...",
        "mainPoints": [...],
        "closing": "...",
        "keyPhrases": [...]
      }
    }
  }
}
```

## Configuration

### Environment Variables
Required in `.env`:
```
NUXT_OPENAI_API_KEY=your-openai-api-key
```

### Offline Mode
When no API key is present:
- Generation returns error message
- Manual generation button remains available
- Existing cached answers still work

## Usage Example

```vue
<template>
  <ModelAnswerCard :topic="currentTopic" />
</template>

<script setup>
import { useWritingTopics } from '~/composables/useWritingTopics'

const { getTopicById } = useWritingTopics()
const currentTopic = getTopicById('c1-topic-1')
</script>
```

## Benefits

✅ **No Hardcoded Data**: All model answers generated dynamically  
✅ **Offline Caching**: Generated once, stored forever in localStorage  
✅ **UUID-based**: Each answer has unique identifier  
✅ **Automatic**: Generates on first view  
✅ **Bilingual**: Supports EN/DE interface  
✅ **Reactive**: UI updates automatically  
✅ **Error Handling**: Graceful fallbacks for failures  

## Testing

### Manual Testing Steps:
1. Clear localStorage: `localStorage.removeItem('model-answers')`
2. Navigate to C1 writing topic
3. Observe loading spinner
4. Verify model answer appears
5. Refresh page - answer should load from cache
6. Check localStorage for stored data

### With OpenAI API:
- Answers should be comprehensive and well-formatted
- Should include highlights (greeting, mainPoints, closing, keyPhrases)
- Word count should be appropriate for C1 level

### Without API Key:
- Should show error state
- Manual generate button should be available
- Previously cached answers should still work

## Future Enhancements

- [ ] Add regenerate button for existing answers
- [ ] Add quality rating for generated answers
- [ ] Support A2 level generation
- [ ] Export/import model answers
- [ ] Admin panel for bulk generation
- [ ] Analytics on generation success rate

## Troubleshooting

**Issue**: Model answer not generating  
**Solution**: Check console for errors, verify API key is set

**Issue**: Old hardcoded answers showing  
**Solution**: Clear localStorage and refresh

**Issue**: Generation takes too long  
**Solution**: OpenAI API can be slow; consider caching strategy

**Issue**: Malformed JSON response  
**Solution**: Check `tryExtractJsonObject()` parsing logic

---

**Author**: AI Assistant  
**Date**: 2025-10-17  
**Version**: 1.0.0

