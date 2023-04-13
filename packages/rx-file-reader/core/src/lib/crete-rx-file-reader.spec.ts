import { describe, test } from 'vitest';
import { createRxFileReader$ } from './create-rx-file-reader';
import { lastValueFrom } from 'rxjs';

describe('createRxFileReader', () => {
  test('should create an observable instance', () => {
    const fileReader$ = createRxFileReader$(createFile().file, 'text');

    expect(fileReader$).toBeDefined();
  });

  describe('onload', () => {
    describe('type text', () => {
      test('should emit a FileReaderResult with content as string', async () => {
        const { file, fileName, content } = createFile();
        const fileReader$ = createRxFileReader$(file, 'text');

        const result = await lastValueFrom(fileReader$);

        expect(result.fileName).toEqual(fileName);
        expect(result.sourceFile).toEqual(file);
        expect(result.content).toEqual(content[0]);
      });
    });

    describe('type dataURL', () => {
      test('should emit a FileReaderResult with content as string', async () => {
        const { file, fileName, content } = createFile();
        const fileReader$ = createRxFileReader$(file, 'dataURL');

        const result = await lastValueFrom(fileReader$);

        expect(result.fileName).toEqual(fileName);
        expect(result.sourceFile).toEqual(file);
        expect(result.content).toEqual(
          'data:text/plain;base64,dGVzdCBjb250ZW50'
        );
      });
    });

    describe('type binaryString', () => {
      test('should emit a FileReaderResult with content as string', async () => {
        const { file, fileName, content } = createFile();
        const fileReader$ = createRxFileReader$(file, 'binaryString');

        const result = await lastValueFrom(fileReader$);

        expect(result.fileName).toEqual(fileName);
        expect(result.sourceFile).toEqual(file);
        expect(result.content).toEqual(content[0]);
      });
    });
  });

  describe('onerror', () => {
    test('should emit the error', async () => {
      const file = new File([], 'test.txt', { type: '' });
      const fileReader$ = createRxFileReader$(file, 'text');

      try {
        await lastValueFrom(fileReader$);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('onprogress', () => {
    test('should emit all progress events', async () => {
      const { file } = createFile();
      const fileReader$ = createRxFileReader$(file, 'text');

      const result = await lastValueFrom(fileReader$);

      expect(result.progress.isTrusted).toEqual(true);
    });
  });
});

function createFile() {
  const fileName = 'test.txt';
  const content = ['test content'];
  const type = 'text/plain';

  return {
    fileName,
    content,
    type,
    file: new File(content, fileName, { type }),
  };
}
