import { repository } from '../src/lib/firestoreRepository';

export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    collegesCount: repository.getColleges().length
  });
}
