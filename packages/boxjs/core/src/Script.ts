import type { Context } from './Context'

export type Script<Props, Result> = (props: Props, context: Context) => Result
