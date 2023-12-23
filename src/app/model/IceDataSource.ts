export class IceDataSource {
  name: string
  url?: string
  relation?: {sourcePath: string, receiverComponentName: string}[]
  event?: string
}
