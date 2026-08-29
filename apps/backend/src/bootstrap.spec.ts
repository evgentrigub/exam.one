import { isSwaggerEnabled } from './bootstrap'

describe('isSwaggerEnabled', () => {
  it('is off in production unless SWAGGER_ENABLED=true', () => {
    expect(isSwaggerEnabled('production', undefined)).toBe(false)
    expect(isSwaggerEnabled('production', 'false')).toBe(false)
    expect(isSwaggerEnabled('production', 'true')).toBe(true)
  })

  it('is on in development unless SWAGGER_ENABLED=false', () => {
    expect(isSwaggerEnabled('development', undefined)).toBe(true)
    expect(isSwaggerEnabled('test', undefined)).toBe(true)
    expect(isSwaggerEnabled('development', 'false')).toBe(false)
  })
})
