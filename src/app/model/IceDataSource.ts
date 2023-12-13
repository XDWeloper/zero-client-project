export class IceDataSource {
  name: string
  url?: string
  relation?: [{source: string, receiver: string}]
  event?: string
}
