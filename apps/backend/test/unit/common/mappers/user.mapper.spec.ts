import { toSettingDto, toUserDto } from '../../../../src/common/mappers/user.mapper'
import { makeSetting, makeUser } from '../../../../src/testing/fixtures'

describe('toUserDto', () => {
  it('slices examTargetDate to YYYY-MM-DD', () => {
    const dto = toUserDto(makeUser({ examTargetDate: new Date('2026-06-15T12:34:56.000Z') }))

    expect(dto.examTargetDate).toBe('2026-06-15')
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('maps a null examTargetDate', () => {
    expect(toUserDto(makeUser({ examTargetDate: null })).examTargetDate).toBeNull()
  })
})

describe('toSettingDto', () => {
  it('maps settings with an ISO updatedAt', () => {
    const dto = toSettingDto(makeSetting({ examLevel: 'C1', targetLanguage: 'de' }))

    expect(dto).toEqual({
      id: 'setting-1',
      userId: 'user-1',
      packId: 'goethe-de-a2',
      examLevel: 'C1',
      targetLanguage: 'de',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
  })
})
