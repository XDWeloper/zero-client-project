import {AngularEditorConfig} from "@kolkov/angular-editor";


export const APP_VERSION="2.0.1"

export const MAKET_NAME_LOAD_ERROR = "Ошибка получения списка доступных макетов"
export const MAKET_LOAD_ERROR = "Ошибка получения макета"
export const MAKET_DELETE_ERROR = "Ошибка удаления макета"

export const REQUEST_TEST_ERROR = "Ошибка получения данных"


export const DOCUMENT_SAVE_ERROR = "Ошибка сохранения документа"
export const DRAFT_SAVE_ERROR = "Ошибка сохранения черновика документа"
export const DOCUMENT_NAME_LOAD_ERROR = "Ошибка загрузки документов"
export const DOCUMENT_LOAD_ERROR = "Ошибка загрузки документа"
export const DOCUMENT_SEND = "Документ отправлен на обработку. Ожидайте результат."
export const DOCUMENT_DRAFT_SAVED = "Документ сохранен как черновик"
export const REGISTRATION_DATA = "Ошибка отправки регистрационных данных."
export const RESET_PASS_ERROR = "Ошибка сброса пароля."
export const RESET_PASS_SUCCESS = "Пароль успешно сброшен."
export const REGISTRATION_CONFIRM_ERROR = "Ошибка регистрации клиента"
export const REGISTRATION_CONFIRM = "Пользователь успешно зарегистрирован"
export const PASSWORD_PROP = "Ошибка получения требований к паролю."
export const FILES_LOAD_ERROR = "Ошибка загрузки файлов"
export const FILES_DELETE_ERROR = "Ошибка удаления файла"
export const PIN_CONFIRM_TIMEOUT = "Время ожидания пин-кода истекло."
export const DOCUMENT_REMOVE_ERROR = "Ошибка удаления документов"
export const FILE_SIZE_ERROR = "Не верный размер файла"
export const BANK_DOCUMENT_LOAD_ERROR = "Ошибка загрузки списка документов"
export const BANK_FILE_LOAD_ERROR = "Ошибка загрузки файла"
export const CHANGE_STATUS_ERROR = "Ошибка смены статуса документа"
export const CHANGE_STATUS_TO_DRAFT = "Документ возвращен на этап редактирования"
export const CHANGE_STATUS_TO_SENDING = "Документ отправлен на обработку в банк"
export const CHANGE_STATUS_TO_AGREE = "Документ отправлен на согласование клиенту"
export const CHANGE_STATUS_TO_INCORRECT = "Документ отправлен клиенту для корректировки"
export const CHANGE_STATUS_TO_REJECT = "Документ отвергнут"
export const GET_DOCUMENT_STATUS_HISTORY_ERROR = "Ошибка получения истории изменения статусов"

export const SET_COMPONENT_NAME_DUPLICATE = "Данное имя компонента уже используется"


export const ERROR = "ERROR"
export const INFO = "INFO"

export const TAB_DOCUMENT_LIST = 0
export const TAB_DOCUMENT_SHOW = 1

export const AlertColor = "#c80082"
export const fiveMin = 300_000
export const freeMin = 180_000



export type DocNameEdit = {
  docName: string
  isActive: boolean
}

export const tableList = [
  {num:1,text:"Сведения об основных контрагентах, планируемых плательщиках и получателях денежных средств"},
  {num:2,text:"Сведения об участниках общества, размерах их долей в уставном капитале и их оплате"},
  {num:3,text:"Произвольная таблица"}
]

export enum IceComponentType{
  TEXT  = "text",
  INPUT = "input",
  AREA  = "area",
  TABLE = "table",
  SELECT= "select",
  PLACE = "place",
  UPLOAD= "upload",
  BUTTON = "button"
}
export enum CellType {
  admin= "admin",
  client = "client"
}

export type DocStat = "DRAFT" | "SENDING" | "PROCESSING" | "INCORRECT" | "ACCEPTED" | "REJECTED" | "CONTROL" | "AGREE"


export const collInRow = 12             /**Всегда 12 колонок в строке это константа не менять!!!! */
export const cellColl = 1               /** На сколько разделена одна колонка*/
export const cellHeight = 8             /** Высота одной строки 8 = 2 rem */
export const cellRow = 20               /** Количество строк*/
export const docPanelCloseWidth = 2.5
export const docPanelOpenWidth = 25
export const propPanelCloseWidth = 2.5
export const propPanelOpenWidth = 20

export const dialogOpenAnimationDuration: string = "500ms"
export const dialogCloseAnimationDuration = "200ms"

export const editorConfig: AngularEditorConfig = {
  editable: true,
  spellcheck: true,
  height: '200px',
  minHeight: '',
  maxHeight: '',
  width: 'auto',
  minWidth: '0',
  translate: 'yes',
  enableToolbar: true,
  showToolbar: true,
  placeholder: 'Введите текст...',
  defaultParagraphSeparator: '',
  defaultFontName: '',
  defaultFontSize: '',
  fonts: [
    {class: 'arial', name: 'Arial'},
    {class: 'times-new-roman', name: 'Times New Roman'},
    {class: 'calibri', name: 'Calibri'},
    {class: 'comic-sans-ms', name: 'Comic Sans MS'}
  ],
  // customClasses: [
  //   {
  //     name: 'quote',
  //     class: 'quote',
  //   },
  //   {
  //     name: 'redText',
  //     class: 'redText'
  //   },
  //   {
  //     name: 'titleText',
  //     class: 'titleText',
  //     tag: 'h1',
  //   },
  // ],
  //uploadUrl: 'https://api.exapple.com/v1/image/upload',
  //upload: (file: File) => { return 'https://api.exapple.com/v1/image/upload'},
  uploadWithCredentials: false,
  sanitize: false,
  toolbarPosition: 'top',
  // toolbarHiddenButtons: [
  //   ['bold', 'italic'],
  //   ['fontSize']
  // ]
};


