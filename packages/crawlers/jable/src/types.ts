export interface Video {
  code: string
  name: string
}

export interface Options {
  list: string
  page: number
  sort: string
}

export interface VideoOptions extends Options {
  list: 'list_videos_common_videos_list'
  sort: VideoSort
}

export interface HotOptions extends Options {
  list: 'list_videos_common_videos_list'
  sort: HotVideoSort
}

export interface LatestOptions extends Options {
  list: 'list_videos_latest_videos_list'
  sort: 'post_date'
}

export interface NewReleaseOptions extends Options {
  list: 'list_videos_common_videos_list'
  sort: 'release_year'
}

export type VideoSort =
  | 'post_date_and_popularity'
  | 'post_date'
  | 'video_viewed'
  | 'most_favourited'

export type HotVideoSort =
  | 'video_viewed'
  | 'video_viewed_month'
  | 'video_viewed_week'
  | 'video_viewed_today'

/**
 * RootApis
 */

export interface RootApisOptions {
  '/hot/': HotOptions
  '/latest-updates/': LatestOptions
  '/new-release/': NewReleaseOptions
}

export const rootApis = ['/hot/', '/latest-updates/', '/new-release/'] as const

export type RootApis = typeof rootApis[number]

export const isRootApis = (api: any): api is RootApis => rootApis.includes(api)

/**
 * Apis
 */
export const apis = [
  '/hot/',
  '/latest-updates/',
  '/new-release/',
  '/categories/bdsm/',
  '/categories/chinese-subtitle/',
  '/categories/groupsex/',
  '/categories/pantyhose/',
  '/categories/pov/',
  '/categories/rape/',
  '/categories/roleplay/',
  '/categories/sex-only/',
  '/categories/uncensored/',
  '/categories/uniform/',
  '/tags/10-times-a-day/',
  '/tags/3p/',
  '/tags/Cosplay/',
  '/tags/affair/',
  '/tags/age-difference/',
  '/tags/anal-sex/',
  '/tags/avenge/',
  '/tags/bathing-place/',
  '/tags/beautiful-butt/',
  '/tags/beautiful-leg/',
  '/tags/big-tits/',
  '/tags/black-pantyhose/',
  '/tags/black/',
  '/tags/blowjob/',
  '/tags/bondage/',
  '/tags/breast-milk/',
  '/tags/bunny-girl/',
  '/tags/car/',
  '/tags/cheongsam/',
  '/tags/chikan/',
  '/tags/chizyo/',
  '/tags/club-hostess-and-sex-worker/',
  '/tags/couple/',
  '/tags/crapulence/',
  '/tags/creampie/',
  '/tags/cum-in-mouth/',
  '/tags/debut-retires/',
  '/tags/deep-throat/',
  '/tags/detective/',
  '/tags/doctor/',
  '/tags/facial/',
  '/tags/female-anchor/',
  '/tags/festival/',
  '/tags/first-night/',
  '/tags/fishnets/',
  '/tags/flesh-toned-pantyhose/',
  '/tags/flexible-body/',
  '/tags/flight-attendant/',
  '/tags/footjob/',
  '/tags/fugitive/',
  '/tags/gang-rape/',
  '/tags/gangbang/',
  '/tags/giant/',
  '/tags/girl/',
  '/tags/glasses/',
  '/tags/gym-room/',
  '/tags/hairless-pussy/',
  '/tags/hidden-cam/',
  '/tags/hot-spring/',
  '/tags/housewife/',
  '/tags/hypnosis/',
  '/tags/idol/',
  '/tags/incest/',
  '/tags/incest/',
  '/tags/insult/',
  '/tags/kemonomimi/',
  '/tags/kimono/',
  '/tags/kiss/',
  '/tags/knee-socks/',
  '/tags/library/',
  '/tags/loli/',
  '/tags/love-potion/',
  '/tags/magic-mirror/',
  '/tags/maid/',
  '/tags/masochism-guy/',
  '/tags/massage/',
  '/tags/mature-woman/',
  '/tags/more-than-4-hours/',
  '/tags/ntr/',
  '/tags/nurse/',
  '/tags/ol/',
  '/tags/outdoor/',
  '/tags/pantyhose/',
  '/tags/piss/',
  '/tags/prison/',
  '/tags/private-teacher/',
  '/tags/quickie/',
  '/tags/rainy-day/',
  '/tags/rape/',
  '/tags/rape/',
  '/tags/school-uniform/',
  '/tags/school/',
  '/tags/sex-beside-husband/',
  '/tags/short-hair/',
  '/tags/small-tits/',
  '/tags/soapland/',
  '/tags/spasms/',
  '/tags/sportswear/',
  '/tags/squirting/',
  '/tags/stockings/',
  '/tags/store/',
  '/tags/suntan/',
  '/tags/swimming-pool/',
  '/tags/swimsuit/',
  '/tags/tall/',
  '/tags/tattoo/',
  '/tags/teacher/',
  '/tags/team-manager/',
  '/tags/temptation/',
  '/tags/thanksgiving/',
  '/tags/time-stop/',
  '/tags/tit-wank/',
  '/tags/toilet/',
  '/tags/torture/',
  '/tags/tram/',
  '/tags/tune/',
  '/tags/ugly-man/',
  '/tags/variety-show/',
  '/tags/video-recording/',
  '/tags/virginity/',
  '/tags/wedding-dress/',
  '/tags/widow/',
  '/tags/wife/'
] as const

export type Apis = typeof apis[number]

export const isApis = (api: any): api is Apis => apis.includes(api)

export type GetOptions = <Api extends Apis>(
  api: Api,
  ...opts: Api extends keyof RootApisOptions
    ? Partial<RootApisOptions[Api]>[]
    : Partial<VideoOptions>[]
) => Api extends keyof RootApisOptions ? RootApisOptions[Api] : VideoOptions

export type GetVideos = <Api extends Apis>(
  api: Api,
  ...opts: Api extends keyof RootApisOptions
    ? Partial<RootApisOptions[Api]>[]
    : Partial<VideoOptions>[]
) => Promise<Video[]>
