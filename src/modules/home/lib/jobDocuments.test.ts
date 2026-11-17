import {
  createJobDocument,
  documentFileError,
  filterJobDocuments,
  formatUploadedAt,
  jobDocumentCounts,
  seedJobDocuments
} from './jobDocuments';

describe('jobDocuments', () => {
  it('starts from the four sample files', () => {
    const docs = seedJobDocuments();
    expect(docs.map((doc) => doc.name)).toEqual([
      'Aadhaar Card.pdf',
      'PAN Card.pdf',
      'Education Certificate.jpg',
      'Experience Letter.pdf'
    ]);
    expect(jobDocumentCounts(docs)).toEqual({
      total: 4,
      verified: 4,
      underReview: 0,
      rejected: 0
    });
  });

  it('filters by file name and category', () => {
    const docs = seedJobDocuments();
    expect(filterJobDocuments(docs, 'pan', 'all').map((doc) => doc.id)).toEqual(['doc-pan']);
    expect(filterJobDocuments(docs, '', 'education').map((doc) => doc.id)).toEqual([
      'doc-education'
    ]);
  });

  it('formats the upload clock the way the screen shows it', () => {
    expect(formatUploadedAt(new Date(2026, 10, 4, 11, 20))).toBe('4 Nov 2026, 11:20 AM');
  });

  it('rejects a file that is not a pdf or image', () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    expect(documentFileError(file)).toBe('Choose a PDF or image.');
  });

  it('marks a new upload as under review', () => {
    const file = new File(['pdf'], 'Offer.pdf', { type: 'application/pdf' });
    const doc = createJobDocument(file, 'experience');
    expect(doc.status).toBe('under-review');
    expect(doc.name).toBe('Offer.pdf');
    expect(jobDocumentCounts([doc]).underReview).toBe(1);
  });
});
