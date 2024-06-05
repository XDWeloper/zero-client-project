import {Observable, tap} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {HttpMethod, Operation} from "../model/RequestBFF";
import {
  BankFile,
  IceComponentValue,
  IceDocument,
  IceDocumentMaket,
  IIceComponentValue,
  LoginPasswordProperties,
  OtpType, ReportData
} from "../interfaces/interfaces";
import {DocNameEdit, DocStat, IceComponentType} from "../constants";
import {map} from "rxjs/operators";
import {compareNumbers} from "@angular/compiler-cli/src/version_helpers";


@Injectable({
  providedIn: 'root'
})

export class BackendService {

  constructor(private http: HttpClient) {  }

  getCoreEnvironment(): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/env"
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  getDocumentStatusHistory(id: number, page?: number,size?: number, sort?: string, order?: string, status?: DocStat | undefined): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + `/core/documents/status?id=${id}&page=${page}&size=${size}&sort=${sort},${order}`
    operation.url +=  (status || (status && status.length > 0)) ? `&status=${status}` : ''
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation);
  }


  downloadFile(documentRef: number, fileId: string): Observable<any> {
    return this.http.get<Blob>(environment.bffURI + "/operation/files/download?documentRef=" + documentRef + "&id=" + fileId,{responseType: 'blob' as 'json'});
  }

  getBankFileList(documentRef: number): Observable<BankFile[]> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/files?documentRef=" + documentRef + "&fileDirection=BNK"
    operation.httpMethod = HttpMethod.GET;
    return this.http.post<BankFile[]>(environment.bffURI + '/operation', operation);
  }


  requestUserProfile(): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/users/profile"
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  getMaketNameList(): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/makets"
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  getMaketFull(id: number): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/makets?id=" + id + "&components=true"
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation)
  }

  updateMaket(maket: IceDocumentMaket): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/makets/" + maket.docId
    operation.httpMethod = HttpMethod.PUT
    operation.body = maket
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  createMaket(maket: IceDocumentMaket): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/makets"
    operation.httpMethod = HttpMethod.POST
    operation.body = maket
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  deleteMaket(maketId: number): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/makets/" + maketId
    operation.httpMethod = HttpMethod.DELETE
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  editMaketName(maketId: number, val:DocNameEdit): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + `/core/makets/${maketId}/updatename`
    operation.httpMethod = HttpMethod.PUT
    operation.body = val
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  /**Документы*/

  createDocument(maket: IceDocument): Observable<any> {
    maket = this.transferValueToAttrib(maket)
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/documents"
    operation.httpMethod = HttpMethod.POST
    operation.body = maket
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  changeStatus(id: number, status: string, reason: string): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + `/core/documents/status/${id}`
    operation.httpMethod = HttpMethod.PUT
    operation.body = {
      reason: reason,
      status: status
    }
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  updateDocument(maket: IceDocument): Observable<any> {
    maket = this.transferValueToAttrib(maket)
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/documents/update/" + maket.id
    operation.httpMethod = HttpMethod.PUT
    operation.body = maket
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  /**Обновить только данные документа*/
  updateOnlyDate(document: IceDocument):Observable<any>{
    document = this.transferValueToAttrib(document)
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/documents/update/" + document.id + "/values"
    operation.httpMethod = HttpMethod.PUT
    operation.body = document.docAttrib.componentValueList.filter(item => item.componentValue != undefined)
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  transferValueToAttrib(maket: IceDocument):IceDocument{
    if(!maket.docAttrib)
      return maket
      let componentValueList: IIceComponentValue[] = maket.docStep.map(value => value.componentMaket)
      .flat()
        .filter(value => value.componentType != IceComponentType.TEXT && value.inputType != "button")
      .map(value => new IceComponentValue(
        value.componentName,
        value.value,
        value.componentType,
        value.notification ? value.notification : value.placeHolder,
        value.enabled ? value.enabled : false,
        value.dataObject))

      maket.docAttrib.componentValueList = componentValueList
    return maket
  }

  getDocumentNameList(page?: number,size?: number, sort?: string, order?: string, docName?: string, createDate?: Date, status?: string, inn?: string, orgName?: string,statusDate?: Date): Observable<any> {
    const operation = new Operation();
    if(sort === "inn") sort = "customAttrib_" + sort
    if(sort === "name") sort = "customAttrib_" + sort

    operation.url = environment.resourceServerURL + `/core/documents?page=${page}&size=${size}&sort=${sort},${order}`
    operation.url +=  docName != undefined ? `&name=${docName}` : ''
    operation.url +=  createDate != undefined ? `&createDate=${createDate}` : ''
    //operation.url +=  statusDate != undefined ? `&statusDate=${statusDate}` : ''
    operation.url +=  status != undefined ? `&status=${status}` : ''
    operation.url +=  inn != undefined ? `&customAttrib_inn=${inn}` : ''
    operation.url +=  orgName != undefined ? `&customAttrib_name=${orgName}` : ''
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  getDocumentFull(id: number): Observable<IceDocument> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/documents?id=" + id + "&components=true"
    operation.httpMethod = HttpMethod.GET;
    return this.http.post<IceDocument>(environment.bffURI + '/operation', operation)
      .pipe(
      map(value => {
        if(!value.docAttrib) return value
        let valueList = value.docAttrib.componentValueList

        value.docStep.map(step => step.componentMaket)
          .flat()
          .filter(comp => comp.componentType != IceComponentType.TEXT && comp.inputType != "button")
          .filter(comp => valueList.map(value => value.componentName).includes(comp.componentName))
          .forEach(createComponent => {
            let currentComponentValue = valueList.find(comp => comp.componentName === createComponent.componentName)
            if(currentComponentValue)
              createComponent.value = currentComponentValue.componentValue
          })
        return value
      })
    );
  }

  removeDocument(id: number): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/documents/" + id
    operation.httpMethod = HttpMethod.DELETE;
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  userRegistration(phone: string, otpType: OtpType): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/otp?otpType=" + otpType + "&phone=" + phone
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  resetPassword(resetBode: any): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/users/reset/password"
    operation.httpMethod = HttpMethod.PUT;
    operation.body = resetBode
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  userConfirmRegistration(userRequest: any): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/users"
    operation.httpMethod = HttpMethod.POST;
    operation.body = userRequest
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  passwordRequirements(): Observable<LoginPasswordProperties> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/users/password/requirement"
    operation.httpMethod = HttpMethod.GET
    return this.http.post<LoginPasswordProperties>(environment.bffURI + '/operation', operation);
  }

  upload(uploadParam: FormData): Observable<any> {
    return this.http.post<any>(environment.bffURI + "/operation/files" , uploadParam, {observe: 'events',reportProgress: true,})
  }

  deleteFileById(fileId: string,documentRef: string): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/files?id=" + fileId + "&documentRef=" + documentRef
    operation.httpMethod = HttpMethod.DELETE
    return this.http.post<any>(environment.bffURI + '/operation', operation,{observe: 'events',reportProgress: true,});
  }

  createReport(reportId: number, reportType: string,params?: any[]): Observable<ReportData> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/report/run"
    operation.httpMethod = HttpMethod.POST
    operation.body = {
      reportId: reportId,
      fileType: reportType,
      p1: params[0] ? params[0] : null,
      p2: params[1] ? params[1] : null,
      p3: params[2] ? params[2] : null,
      p4: params[3] ? params[3] : null,
      p5: params[4] ? params[4] : null,
      p6: params[5] ? params[5] : null,
      p7: params[6] ? params[6] : null,
      p8: params[7] ? params[7] : null,
      p9: params[8] ? params[8] : null,
      p10: params[9] ? params[9] : null,
    }
    return this.http.post<ReportData>(environment.bffURI + '/operation', operation,);
  }

  getReportStatus(reportUID: string): Observable<ReportData> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/report/" + reportUID
    operation.httpMethod = HttpMethod.GET
    return this.http.post<ReportData>(environment.bffURI + '/operation', operation,);
  }
}
