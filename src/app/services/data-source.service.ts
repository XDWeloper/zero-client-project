import { Injectable } from '@angular/core';

export class DataSourceMap {
  key: string
  value?: any
  componentName?: string
}


@Injectable({
  providedIn: 'root'
})
export class DataSourceService {
  currentKeyPath: string = ""
  dataSourceMap: DataSourceMap[] = []

  constructor() { }

  getData(url: string): DataSourceMap[]{
    this.dataSourceMap.splice(0,this.dataSourceMap.length)

    let value = JSON.parse(jsonValue)
    //console.log(value)
    this.reverseValue(value)

    // this.http.get(url).subscribe({
    //   next: value => {
    //     this.reverseValue(value)
    //     console.log("Finish!!!")
    //   }
    // })
    return this.dataSourceMap
  }


  reverseValue(object: any) {
    let tempKey = this.currentKeyPath
    let key = Object.keys(object)
    key.forEach(k => {
        let val = object[k]
        if (isNaN(Number(k)))
          this.currentKeyPath += "." + k.trim()
        if ((typeof val) === "string") {
          //console.log(this.currentKeyPath.substring(1, this.currentKeyPath.length), " : ", val)
          this.dataSourceMap.push({key: this.currentKeyPath.substring(1, this.currentKeyPath.length), value: val})
          this.currentKeyPath = tempKey
        }
        if ((typeof val) === "object") {
          this.reverseValue(val)
          this.currentKeyPath = tempKey
        }
      }
    )
    this.currentKeyPath = tempKey
  }
}

export const jsonValue = "{\"items\":[{\"ЮЛ\":{\"ИНН\":\"2632098650\",\"КПП\":\"263201001\",\"ОГРН\":\"1102632001438\",\"ДатаОГРН\":\"2010-04-30\",\"ДатаРег\":\"2010-04-30\",\"ОКОПФ\":\"Общества с ограниченной ответственностью\",\"КодОКОПФ\":\"12300\",\"Статус\":\"Действующее\",\"СпОбрЮЛ\":\"Создание юридического лица\",\"НО\":{\"Рег\":\"2651 (Межрайонная инспекция Федеральной налоговой службы № 11 по Ставропольскому краю)\",\"РегДата\":\"2011-01-15\",\"Учет\":\"2632 (Межрайонная инспекция Федеральной налоговой службы № 15 по Ставропольскому краю)\",\"УчетДата\":\"2010-05-04\"},\"ПФ\":{\"РегНомПФ\":\"036032107326\",\"ДатаРегПФ\":\"2010-05-04\",\"КодПФ\":\"036032 (Отделение Фонда пенсионного и социального страхования Российской Федерации по Ставропольскому краю)\"},\"ФСС\":{\"РегНомФСС\":\"262100957026091\",\"ДатаРегФСС\":\"2010-05-05\",\"КодФСС\":\"2609 (Отделение Фонда пенсионного и социального страхования Российской Федерации по Ставропольскому краю)\"},\"КодыСтат\":{\"ОКПО\":\"0063919827\",\"ОКТМО\":\"7727000001\",\"ОКФС\":\"16\",\"ОКОГУ\":\"4210014\"},\"Капитал\":{\"ВидКап\":\"Уставный капитал\",\"СумКап\":\"19600\",\"Дата\":\"2011-06-23\"},\"НаимСокрЮЛ\":\"ООО ИНВЕРСИЯ - КАВКАЗ\",\"НаимПолнЮЛ\":\"ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ ИНВЕРСИЯ - КАВКАЗ\",\"Адрес\":{\"КодРегион\":\"26\",\"Индекс\":\"357500\",\"АдресПолн\":\"край Ставропольский, г. Пятигорск, пр-кт Кирова, д.36, кв.12\",\"АдресДетали\":{\"Регион\":{\"Наим\":\"КРАЙ СТАВРОПОЛЬСКИЙ\"},\"Город\":{\"Тип\":\"ГОРОД\",\"Наим\":\"ПЯТИГОРСК\"},\"Улица\":{\"Тип\":\"ПРОСПЕКТ\",\"Наим\":\"КИРОВА\"},\"Дом\":\"ДОМ 36\",\"Помещ\":\"КВАРТИРА 12\"},\"Дата\":\"2011-03-16\"},\"Руководитель\":{\"ВидДолжн\":\"Руководитель юридического лица\",\"Должн\":\"Директор\",\"ФИОПолн\":\"Пентешин Александр Павлович\",\"ИННФЛ\":\"615000738897\",\"Пол\":\"Мужской\",\"ВидГражд\":\"Гражданин РФ\",\"Дата\":\"2018-04-13\"},\"Учредители\":[{\"УчрФЛ\":{\"ФИОПолн\":\"Пентешин Александр Павлович\",\"ИННФЛ\":\"615000738897\",\"Пол\":\"Мужской\",\"ВидГражд\":\"Гражданин РФ\"},\"СуммаУК\":\"10000\",\"Процент\":\"51.02\",\"Дата\":\"2011-06-23\"},{\"УчрФЛ\":{\"ФИОПолн\":\"Пентешина Лилия Владимировна\",\"ИННФЛ\":\"615015376858\",\"Пол\":\"Женский\",\"ВидГражд\":\"Гражданин РФ\"},\"СуммаУК\":\"2940\",\"Процент\":\"15\",\"Дата\":\"2011-06-23\"},{\"УчрФЛ\":{\"ФИОПолн\":\"Бугаев Валерий Владимирович\",\"ИННФЛ\":\"262500730203\",\"Пол\":\"Мужской\",\"ВидГражд\":\"Гражданин РФ\"},\"СуммаУК\":\"3720\",\"Процент\":\"18.98\",\"Дата\":\"2019-11-29\"},{\"УчрФЛ\":{\"ФИОПолн\":\"Афанасьева Татьяна Михайловна\",\"ИННФЛ\":\"262701779583\",\"Пол\":\"Женский\",\"ВидГражд\":\"Гражданин РФ\"},\"СуммаУК\":\"980\",\"Процент\":\"5\",\"Дата\":\"2019-11-29\"},{\"УчрФЛ\":{\"ФИОПолн\":\"Пентешин Константин Александрович\",\"ИННФЛ\":\"615006747136\",\"Пол\":\"Мужской\",\"ВидГражд\":\"Гражданин РФ\"},\"СуммаУК\":\"1960\",\"Процент\":\"10\",\"Дата\":\"2022-06-01\"}],\"Контакты\":{\"Телефон\":[\"+79885407903\",\"+78635277105\",\"+78793389301\",\"+79185519275\",\"+79624977717\"],\"Сайт\":[\"inversion-kavkaz.ru\"]},\"ОснВидДеят\":{\"Код\":\"62.01\",\"Текст\":\"Разработка компьютерного программного обеспечения\",\"Дата\":\"2017-08-25\"},\"ДопВидДеят\":[{\"Код\":\"62.02\",\"Текст\":\"Деятельность консультативная и работы в области компьютерных технологий\",\"Дата\":\"2010-04-30\"},{\"Код\":\"62.09\",\"Текст\":\"Деятельность, связанная с использованием вычислительной техники и информационных технологий, прочая\",\"Дата\":\"2010-04-30\"},{\"Код\":\"63.1\",\"Текст\":\"Деятельность по обработке данных, предоставление услуг по размещению информации, деятельность порталов в информационно-коммуникационной сети Интернет\",\"Дата\":\"2010-04-30\"},{\"Код\":\"63.11.1\",\"Текст\":\"Деятельность по созданию и использованию баз данных и информационных ресурсов\",\"Дата\":\"2010-04-30\"}],\"СПВЗ\":[{\"Дата\":\"2022-11-05\",\"Текст\":\"Представление сведений о регистрации физического лица по месту жительства\"},{\"Дата\":\"2022-08-08\",\"Текст\":\"Представление сведений о выдаче или замене документов, удостоверяющих личность гражданина Российской Федерации на территории Российской Федерации\"},{\"Дата\":\"2022-06-01\",\"Текст\":\"Изменение сведений о юридическом лице, содержащихся в Едином государственном реестре юридических лиц\"},{\"Дата\":\"2021-09-10\",\"Текст\":\"Представление сведений о выдаче или замене документов, удостоверяющих личность гражданина Российской Федерации на территории Российской Федерации\"},{\"Дата\":\"2019-11-29\",\"Текст\":\"Изменение сведений о юридическом лице, содержащихся в Едином государственном реестре юридических лиц\"},{\"Дата\":\"2019-08-15\",\"Текст\":\"Представление сведений о регистрации юридического лица в качестве страхователя в исполнительном органе Фонда социального страхования Российской Федерации\"},{\"Дата\":\"2018-04-13\",\"Текст\":\"Представление сведений о выдаче или замене документов, удостоверяющих личность гражданина Российской Федерации на территории Российской Федерации\"},{\"Дата\":\"2017-08-25\",\"Текст\":\"Изменение сведений о юридическом лице, содержащихся в Едином государственном реестре юридических лиц\"},{\"Дата\":\"2011-06-23\",\"Текст\":\"Государственная регистрация изменений, внесенных в учредительный документ юридического лица, и внесение изменений в сведения о юридическом лице, содержащиеся в ЕГРЮЛ\"},{\"Дата\":\"2011-06-23\",\"Текст\":\"Изменение сведений о юридическом лице, содержащихся в Едином государственном реестре юридических лиц\"},{\"Дата\":\"2011-03-16\",\"Текст\":\"Государственная регистрация изменений, внесенных в учредительный документ юридического лица, и внесение изменений в сведения о юридическом лице, содержащиеся в ЕГРЮЛ\"},{\"Дата\":\"2010-05-21\",\"Текст\":\"Представление сведений о регистрации юридического лица в качестве страхователя в исполнительном органе Фонда социального страхования Российской Федерации\"},{\"Дата\":\"2010-05-11\",\"Текст\":\"Представление сведений о регистрации юридического лица в качестве страхователя в территориальном органе Пенсионного фонда Российской Федерации\"},{\"Дата\":\"2010-05-04\",\"Текст\":\"Представление сведений об учете юридического лица в налоговом органе\"},{\"Дата\":\"2010-04-30\",\"Текст\":\"Создание юридического лица\"}],\"ОткрСведения\":{\"КолРаб\":\"15\",\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Налоги\":[{\"НаимНалог\":\"Страховые взносы на обязательное медицинское страхование работающего населения, зачисляемые в бюджет Федерального фонда обязательного медицинского страхования\",\"СумУплНал\":\"1033787.37\"},{\"НаимНалог\":\"Страховые и другие взносы на обязательное пенсионное страхование, зачисляемые в Пенсионный фонд Российской Федерации\",\"СумУплНал\":\"2348632.65\"},{\"НаимНалог\":\"Налог, взимаемый в связи с  применением упрощенной  системы налогообложения\",\"СумУплНал\":\"3001085\"},{\"НаимНалог\":\"Страховые взносы на обязательное социальное страхование на случай временной нетрудоспособности и в связи с материнством\",\"СумУплНал\":\"57180.85\"},{\"НаимНалог\":\"Транспортный налог\",\"СумУплНал\":\"18307.73\"},{\"НаимНалог\":\"НЕНАЛОГОВЫЕ ДОХОДЫ, администрируемые налоговыми органами\",\"СумУплНал\":\"0\"},{\"НаимНалог\":\"Государственная пошлина\",\"СумУплНал\":\"300\"}],\"СумДоход\":\"98721000\",\"СумРасход\":\"65582000\",\"ОтраслевыеПок\":{\"НалогНагрузка\":\"0.148182498\",\"Рентабельность\":\"0.123\"},\"Дата\":\"2023-01-01\"},\"История\":{\"Руководитель\":{\"2010-04-30 ~ 2018-04-12\":{\"ФИОПолн\":\"Пентешин Александр Павлович\",\"ИННФЛ\":\"615000738897\",\"Пол\":\"Мужской\",\"ВидГражд\":\"Гражданин РФ\",\"Должн\":\"Директор\"}},\"НомТел\":{\"2010-04-30 ~ 2017-08-24\":\"5519275\"},\"Учредители\":[{\"УчрФЛ\":{\"ФИОПолн\":\"Бугаев Валерий Владимирович\"},\"СуммаУК\":\"4700\",\"Процент\":\"23.98\",\"Дата\":\"2011-06-23\",\"ДатаОконч\":\"2016-07-24\"},{\"УчрФЛ\":{\"ФИОПолн\":\"Бугаев Валерий Владимирович\",\"ИННФЛ\":\"262500730203\",\"Пол\":\"Мужской\",\"ВидГражд\":\"Гражданин РФ\"},\"СуммаУК\":\"4700\",\"Процент\":\"23.98\",\"Дата\":\"2011-06-23\",\"ДатаОконч\":\"2019-11-28\"},{\"УчрФЛ\":{\"ФИОПолн\":\"Пентешин Сергей Александрович\"},\"СуммаУК\":\"1960\",\"Процент\":\"10\",\"Дата\":\"2011-06-23\",\"ДатаОконч\":\"2019-11-28\"},{\"УчрФЛ\":{\"ФИОПолн\":\"Пентешин Сергей Александрович\",\"ИННФЛ\":\"615004364699\",\"Пол\":\"Мужской\",\"ВидГражд\":\"Гражданин РФ\"},\"СуммаУК\":\"1960\",\"Процент\":\"10\",\"Дата\":\"2011-06-23\",\"ДатаОконч\":\"2022-05-31\"}],\"ОткрСведения\":[{\"КолРаб\":\"12\",\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Налоги\":[{\"НаимНалог\":\"Страховые взносы на обязательное медицинское страхование работающего населения, зачисляемые в бюджет Федерального фонда обязательного медицинского страхования\",\"СумУплНал\":\"182534.62\"},{\"НаимНалог\":\"Страховые и другие взносы на обязательное пенсионное страхование, зачисляемые в Пенсионный фонд Российской Федерации\",\"СумУплНал\":\"2104038.19\"},{\"НаимНалог\":\"Налог, взимаемый в связи с  применением упрощенной  системы налогообложения\",\"СумУплНал\":\"1137453\"},{\"НаимНалог\":\"Страховые взносы на обязательное социальное страхование на случай временной нетрудоспособности и в связи с материнством\",\"СумУплНал\":\"24973.05\"},{\"НаимНалог\":\"Транспортный налог\",\"СумУплНал\":\"25783\"}],\"СумДоход\":\"56905000\",\"СумРасход\":\"40759000\",\"ОтраслевыеПок\":{\"НалогНагрузка\":\"0.163\",\"Рентабельность\":\"0.142\"},\"Дата\":\"2018-01-01\"},{\"КолРаб\":\"15\",\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Налоги\":[{\"НаимНалог\":\"Страховые взносы на обязательное медицинское страхование работающего населения, зачисляемые в бюджет Федерального фонда обязательного медицинского страхования\",\"СумУплНал\":\"1171967.48\"},{\"НаимНалог\":\"Страховые и другие взносы на обязательное пенсионное страхование, зачисляемые в Пенсионный фонд Российской Федерации\",\"СумУплНал\":\"3091900.07\"},{\"НаимНалог\":\"Налог, взимаемый в связи с  применением упрощенной  системы налогообложения\",\"СумУплНал\":\"2625759\"},{\"НаимНалог\":\"Страховые взносы на обязательное социальное страхование на случай временной нетрудоспособности и в связи с материнством\",\"СумУплНал\":\"342506.19\"},{\"НаимНалог\":\"Транспортный налог\",\"СумУплНал\":\"19769\"}],\"СумДоход\":\"80444000\",\"СумРасход\":\"56475000\",\"ОтраслевыеПок\":{\"НалогНагрузка\":\"0.165\"},\"Дата\":\"2019-01-01\"},{\"КолРаб\":\"15\",\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Налоги\":[{\"НаимНалог\":\"Страховые взносы на обязательное медицинское страхование работающего населения, зачисляемые в бюджет Федерального фонда обязательного медицинского страхования\",\"СумУплНал\":\"906483.89\"},{\"НаимНалог\":\"Страховые и другие взносы на обязательное пенсионное страхование, зачисляемые в Пенсионный фонд Российской Федерации\",\"СумУплНал\":\"3499700.99\"},{\"НаимНалог\":\"Налог, взимаемый в связи с  применением упрощенной  системы налогообложения\",\"СумУплНал\":\"2830754\"},{\"НаимНалог\":\"Страховые взносы на обязательное социальное страхование на случай временной нетрудоспособности и в связи с материнством\",\"СумУплНал\":\"332963.12\"},{\"НаимНалог\":\"Транспортный налог\",\"СумУплНал\":\"20213\"}],\"СумДоход\":\"102535000\",\"СумРасход\":\"74996000\",\"ОтраслевыеПок\":{\"НалогНагрузка\":\"0.172\",\"Рентабельность\":\"0.16\"},\"Дата\":\"2020-01-01\"},{\"КолРаб\":\"17\",\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Налоги\":[{\"НаимНалог\":\"Страховые взносы на обязательное медицинское страхование работающего населения, зачисляемые в бюджет Федерального фонда обязательного медицинского страхования\",\"СумУплНал\":\"924513.91\"},{\"НаимНалог\":\"Страховые и другие взносы на обязательное пенсионное страхование, зачисляемые в Пенсионный фонд Российской Федерации\",\"СумУплНал\":\"2619724.61\"},{\"НаимНалог\":\"Налог, взимаемый в связи с  применением упрощенной  системы налогообложения\",\"СумУплНал\":\"2515887\"},{\"НаимНалог\":\"Страховые взносы на обязательное социальное страхование на случай временной нетрудоспособности и в связи с материнством\",\"СумУплНал\":\"164106.7\"},{\"НаимНалог\":\"Транспортный налог\",\"СумУплНал\":\"34117\"}],\"СумДоход\":\"82009000\",\"СумРасход\":\"70825000\",\"ОтраслевыеПок\":{\"НалогНагрузка\":\"0.173327587\",\"Рентабельность\":\"0.128\"},\"Дата\":\"2021-01-01\"},{\"КолРаб\":\"16\",\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Налоги\":[{\"НаимНалог\":\"Страховые взносы на обязательное медицинское страхование работающего населения, зачисляемые в бюджет Федерального фонда обязательного медицинского страхования\",\"СумУплНал\":\"979595.19\"},{\"НаимНалог\":\"Страховые и другие взносы на обязательное пенсионное страхование, зачисляемые в Пенсионный фонд Российской Федерации\",\"СумУплНал\":\"2235060.19\"},{\"НаимНалог\":\"Налог, взимаемый в связи с  применением упрощенной  системы налогообложения\",\"СумУплНал\":\"2447994\"},{\"НаимНалог\":\"Страховые взносы на обязательное социальное страхование на случай временной нетрудоспособности и в связи с материнством\",\"СумУплНал\":\"59583.51\"},{\"НаимНалог\":\"Транспортный налог\",\"СумУплНал\":\"20072\"}],\"СумДоход\":\"81640000\",\"СумРасход\":\"61937000\",\"ОтраслевыеПок\":{\"НалогНагрузка\":\"0.146905853\",\"Рентабельность\":\"0.136\"},\"Дата\":\"2022-01-01\"},{\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Дата\":\"2023-05-01\"},{\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Дата\":\"2023-06-01\"},{\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Дата\":\"2023-07-01\"},{\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Дата\":\"2023-08-01\"},{\"СведСНР\":\"УСН\",\"ПризнУчКГН\":\"Нет\",\"Дата\":\"2023-09-01\"}]}}}]}"

//export const dataSourceEmulation = "[{\"name\": \"Источник данных 0\",\"relation\": [{\"receiverComponentName\": \"text3\",\"sourcePath\": \"items.ЮЛ.ИНН\"}],\"url\": \"czxzcvzx\"}]"

export const dataSourceEmulation = "[{\"id\": 0,\"name\": \"Источник данных 0\",\"relation\": [{\"receiverComponentName\": \"input12\",\"sourcePath\": \"items.ЮЛ.НаимПолнЮЛ\"}],\"url\": \"fdfsdfd\"}]"
