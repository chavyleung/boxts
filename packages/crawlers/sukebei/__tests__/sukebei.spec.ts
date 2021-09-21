import { usePlaywright } from '@boxts/crawler'
import { getMagnets, sortMagnets } from '@boxts/sukebei'

beforeAll(() => usePlaywright())
afterAll(() => usePlaywright().then((playwright) => playwright.close()))

// prettier-ignore
const MAGNETS=[{url:'magnet:?xt=urn:btih:296e3af527f827c1850abdcb1562d5bf2ebb98b7',name:'[HD] SSIS-177 グラドルとキスキスキス...プルンプルンの恵体唇で夢中で舌を絡ませる密着ディープキス性交 安位カヲル',size:7.9,downloads:124},{url:'magnet:?xt=urn:btih:a3065873d41282f20eff33790266f8693bf6e3a1',name:'SSIS-177 グラドルとキスキスキス…プルンプルンの恵体唇で夢中で舌を絡ませる密着ディープキス性交 安位カヲル',size:7.9,downloads:27},{url:'magnet:?xt=urn:btih:e1bf3c6056676b355ef30ecd1f1a9238ee19c12a',name:'ssis-177 グラドルとキスキスキス…プルンプルンの恵体唇で夢中で舌を絡ませる密着ディープキス性交 安位カヲル',size:7.6,downloads:30},{url:'magnet:?xt=urn:btih:6e4a259249c64b67f46ed5e569c198525049faf2',name:'SSIS-177 グラドルとキスキスキス…プルンプルンの恵体唇で夢中で舌を絡ませる密着ディープキス性交 安位カヲル',size:3.3,downloads:511},{url:'magnet:?xt=urn:btih:3654b6275c7e1edbea76bfbd152cd3caf6830fd5',name:'SSIS-177 グラドルとキスキスキス...プルンプルンの恵体唇で夢中で舌を絡ませる密着ディープキス性交 安位カヲル',size:2.9,downloads:338},{url:'magnet:?xt=urn:btih:27d9aa71ded49a411b011384169a1c0a948e4eca',name:'SSIS-177 グラドルとキスキスキス…プルンプルンの恵体唇で夢中で舌を絡ませる密着ディープキス性交 安位カヲル',size:2.7,downloads:1179},{url:'magnet:?xt=urn:btih:bc2fe0ad35a9ac58161682a28f196404ae5008b8',name:'SSIS-177 グラドルとキスキスキス…プルンプルンの恵体唇で夢中で舌を絡ませる密着ディープキス性交 安位カヲル',size:2.7,downloads:352}]

describe('@boxts/sukebei', () => {
  it('getMangets', async () => {
    const magnets = await getMagnets('ssis-177')
    console.info(magnets)
    expect(magnets.length).toBeGreaterThan(0)
  })

  it('getMangets: error', async () => {
    const magnets = await getMagnets('heyzo-2601')
    expect(magnets.length).toBe(0)
  })

  it('sortMagnets', () => {
    const sortedMagnets = sortMagnets(MAGNETS, {
      minSize: 5,
      sort: 'downloads'
    })

    const firstMagnetUrl = sortedMagnets?.[0]?.url
    expect(sortedMagnets.length).toBe(3)
    expect(sortedMagnets[0].url).toBe(firstMagnetUrl)
  })
})
