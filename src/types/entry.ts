
export interface Entry {
  id?: string;
  date: string;
  passNumber: string;
  cusdecNo: string;
  containerNo: string;
  destination: string;
  truckNumber: string;
  item: string;
  tokenNumber: string;
  status: 'IN' | 'OUT';
  name: string;
  feet: '20 FEET' | '40 FEET';
  createdAt?: string | null;
}
