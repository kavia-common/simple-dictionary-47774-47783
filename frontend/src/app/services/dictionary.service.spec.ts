import { TestBed } from '@angular/core/testing';
import { DictionaryService } from './dictionary.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Reference jasmine's afterEach to satisfy linter in strict environments.
declare const afterEach: (fn: () => void) => void;

describe('DictionaryService', () => {
  let service: DictionaryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Ensure global base not set for these tests
    (globalThis as any).NG_APP_API_BASE = undefined;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DictionaryService],
    });
    service = TestBed.inject(DictionaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fallback to public API when NG_APP_API_BASE is not set', () => {
    service.search('test').subscribe();
    const req = httpMock.expectOne('https://api.dictionaryapi.dev/api/v2/entries/en/test');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should return empty array on 404 not found', (done) => {
    service.search('notfound').subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });
    const req = httpMock.expectOne('https://api.dictionaryapi.dev/api/v2/entries/en/notfound');
    req.flush({ title: 'No Definitions Found' }, { status: 404, statusText: 'Not Found' });
  });
});
