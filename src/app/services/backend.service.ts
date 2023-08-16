import {Observable, tap} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders, HttpRequest} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {HttpMethod, Operation} from "../model/RequestBFF";
import {
  BankFile,
  IceDocument,
  IceDocumentMaket,
  LoginPasswordProperties,
  OtpType,
  UploadFile
} from "../interfaces/interfaces";
import {DocNameEdit} from "../constants";
import {List} from "postcss/lib/list";
import {map} from "rxjs/operators";


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
    return this.http.post(environment.bffURI + '/operation', operation);
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
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/documents"
    operation.httpMethod = HttpMethod.POST
    operation.body = maket
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  updateDocument(maket: IceDocument): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/documents/update/" + maket.id
    operation.httpMethod = HttpMethod.PUT
    operation.body = maket
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  getDocumentNameList(page?: number,size?: number, sort?: string, order?: string, docName?: string, createDate?: Date, status?: string): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + `/core/documents?page=${page}&size=${size}&sort=${sort},${order}`
    operation.url +=  docName != undefined ? `&name=${docName}` : ''
    operation.url +=  createDate != undefined ? `&createDate=${createDate}` : ''
    operation.url +=  status != undefined ? `&status=${status}` : ''
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation);
  }

  getDocumentFull(id: number): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/documents?id=" + id + "&components=true"
    operation.httpMethod = HttpMethod.GET;
    return this.http.post(environment.bffURI + '/operation', operation);
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
    return this.http.post<any>(environment.bffURI + "/operation/files" , uploadParam)
  }

  deleteFileById(fileId: string,documentRef: string): Observable<any> {
    const operation = new Operation();
    operation.url = environment.resourceServerURL + "/core/files?id=" + fileId + "&documentRef=" + documentRef
    operation.httpMethod = HttpMethod.DELETE
    return this.http.post<any>(environment.bffURI + '/operation', operation);
  }


}
