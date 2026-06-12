declare namespace Express {
  interface Request {
    currentId: number;
    companyId: number;
    branchId:  number;
    username:  string;
  }
}