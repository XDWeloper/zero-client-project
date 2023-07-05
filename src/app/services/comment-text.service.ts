import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CommentTextService {
  commentText$ = new Subject<string>()
  constructor() { }
}
