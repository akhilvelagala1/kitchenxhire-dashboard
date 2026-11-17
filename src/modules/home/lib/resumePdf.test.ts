import { emptyResumeWizardValues } from '../schemas/jobSeekerResumeWizard';
import { downloadResumePdf, rewriteUnsupportedCssColors } from './resumePdf';

const save = vi.fn();
const addImage = vi.fn();
const addPage = vi.fn();

vi.mock('jspdf', () => ({
  jsPDF: function MockJsPDF() {
    return {
      internal: { pageSize: { getWidth: () => 595, getHeight: () => 842 } },
      addImage,
      addPage,
      save
    };
  }
}));

vi.mock('html2canvas', () => ({
  default: vi.fn(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 794;
    canvas.height = 500;
    return canvas;
  })
}));

describe('rewriteUnsupportedCssColors', () => {
  it('turns an oklab gradient stop into rgba and leaves rgb stops alone', () => {
    const input =
      'linear-gradient(to left bottom, rgb(255, 79, 24) 0%, oklab(0.91 0.03 0.03 / 0.8) 100%)';

    expect(rewriteUnsupportedCssColors(input, () => 'rgba(255, 216, 200, 0.8)')).toBe(
      'linear-gradient(to left bottom, rgb(255, 79, 24) 0%, rgba(255, 216, 200, 0.8) 100%)'
    );
  });

  it('drops a color-space hint the PDF tool cannot read', () => {
    const input = 'linear-gradient(to bottom left in oklab, oklab(0.5 0.1 0.1) 0%, red 100%)';

    expect(rewriteUnsupportedCssColors(input, () => 'rgba(255, 79, 24, 1)')).toBe(
      'linear-gradient(to bottom left, rgba(255, 79, 24, 1) 0%, red 100%)'
    );
  });
});

describe('downloadResumePdf', () => {
  it('captures the preview template and saves a white A4 PDF', async () => {
    await downloadResumePdf(
      {
        ...emptyResumeWizardValues,
        fullName: 'KitchenX Member',
        mobile: '+91 95000 00024',
        city: 'Hyderabad, Telangana',
        dateOfBirth: '2026-11-05',
        professionalSummary: 'Cook with kitchen experience',
        qualification: '10th pass',
        languages: ['Hindi', 'English'],
        skills: ['Food prep', 'Cutting'],
        workHistory: [
          {
            jobTitle: 'Cook',
            workplaceType: 'Hotel',
            employmentType: 'Full-time',
            yearsOfExperience: '2',
            startDate: '2026-01',
            description: 'Prep work on the line'
          }
        ]
      },
      'KitchenX_Member'
    );

    expect(addImage).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith('KitchenX_Member_KitchenX_Resume.pdf');
  });

  it('snapshots the on-screen preview sheet when it is already mounted', async () => {
    const sheet = document.createElement('article');
    sheet.id = 'resume-preview-sheet';
    document.body.appendChild(sheet);

    await downloadResumePdf({ ...emptyResumeWizardValues, fullName: 'On Screen' }, 'On_Screen');

    expect(save).toHaveBeenCalledWith('On_Screen_KitchenX_Resume.pdf');
    sheet.remove();
  });
});
