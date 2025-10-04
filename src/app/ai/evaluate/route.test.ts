import { POST } from './route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    markingSheet: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: '{"answer1": 5}',
      }),
    },
  })),
}));

describe('/ai/evaluate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should evaluate answers successfully with ms', async () => {
    const mockReq = {
      json: jest.fn().mockResolvedValue({
        qp: { questions: [{ text: 'Q1', marks: 5 }] },
        answers: [{ rollNo: '123', name: 'Test', slot: 'F1', examType: 'MID', answer1: 'Ans' }],
        ms: { items: [{ criteria: 'Correct', marks: 5 }] }
      })
    };

    (prisma.markingSheet.upsert as jest.Mock).mockResolvedValue({});

    const res = await POST(mockReq as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.results).toHaveLength(1);
  });

  it('should handle missing ms gracefully', async () => {
    const mockReq = {
      json: jest.fn().mockResolvedValue({
        qp: { questions: [{ text: 'Q1', marks: 5 }] },
        answers: [{ rollNo: '123', name: 'Test', slot: 'F1', examType: 'MID', answer1: 'Ans' }],
        ms: null
      })
    };

    (prisma.markingSheet.upsert as jest.Mock).mockResolvedValue({});

    const res = await POST(mockReq as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.results).toHaveLength(1);
  });

  it('should return 400 for missing qp', async () => {
    const mockReq = {
      json: jest.fn().mockResolvedValue({
        qp: null,
        answers: [{ rollNo: '123', answer1: 'Ans' }],
        ms: null
      })
    };

    const res = await POST(mockReq as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Missing qp');
  });

  it('should return 400 for non-array answers', async () => {
    const mockReq = {
      json: jest.fn().mockResolvedValue({
        qp: { questions: [] },
        answers: 'not an array',
        ms: null
      })
    };

    const res = await POST(mockReq as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('answers array');
  });
});