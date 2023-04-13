import { Observable } from 'rxjs';

export interface FileReaderResult<R extends string | ArrayBuffer | null> {
  fileName: string;
  sourceFile: File;
  content: R;
}

export interface RxFileReaderConfig {
  resultFormat: 'text' | 'arrayBuffer' | 'dataURL' | 'binaryString';
}

export type RxFileReaderResultFormat =
  | 'text'
  | 'arrayBuffer'
  | 'dataURL'
  | 'binaryString';

export function createRxFileReader$(
  file: File,
  format: 'text'
): Observable<FileReaderResult<string>>;
export function createRxFileReader$(
  file: File,
  format: 'arrayBuffer'
): Observable<FileReaderResult<ArrayBuffer>>;
export function createRxFileReader$(
  file: File,
  format: 'dataURL'
): Observable<FileReaderResult<string>>;
export function createRxFileReader$(
  file: File,
  format: 'binaryString'
): Observable<FileReaderResult<string>>;
export function createRxFileReader$<R extends string | ArrayBuffer | null>(
  file: File,
  format: RxFileReaderResultFormat
): Observable<FileReaderResult<R>> {
  return new Observable<FileReaderResult<R>>((observer) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      observer.next({
        fileName: file.name,
        sourceFile: file,
        content: fileReader.result as R,
      });
      observer.complete();
    };

    fileReader.onerror = (error) => {
      observer.error(error);
    };

    fileReader.onabort = () => {
      observer.unsubscribe();
    };

    fileReader.onprogress = (progressEvent: ProgressEvent<FileReader>) => {
      // todo accumulate progress. look at suspensify operator from jscutlery
    };

    if (format === 'text') {
      fileReader.readAsText(file);
    } else if (format === 'arrayBuffer') {
      fileReader.readAsArrayBuffer(file);
    } else if (format === 'dataURL') {
      fileReader.readAsDataURL(file);
    } else if (format === 'binaryString') {
      fileReader.readAsBinaryString(file);
    } else {
      throw new Error('Unknown result format');
    }

    return () => {
      // Clean up file reader if subscription is unsubscribed
      fileReader.abort();
    };
  });
}
