export interface Notification {
  notify(
    title: string,
    subTitle?: string,
    description?: string,
    options?: NotifyOptions
  ): void
}

export interface NotifyOptions {}
