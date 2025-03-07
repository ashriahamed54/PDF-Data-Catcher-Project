
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Entry } from '@/types/entry';

interface DataEntryFormProps {
  onSubmit: (entry: Omit<Entry, 'id'>) => void;
  pdfData?: Omit<Entry, 'id'>;
}

const DataEntryForm = ({ onSubmit, pdfData }: DataEntryFormProps) => {
  const [formData, setFormData] = useState<Omit<Entry, 'id'>>({
    date: '',
    passNumber: '',
    cusdecNo: '',
    containerNo: '',
    destination: '',
    truckNumber: '',
    item: '',
    tokenNumber: '',
    status: 'IN',
    name: '',
    feet: '20 FEET'
  });

  useEffect(() => {
    if (pdfData) {
      console.log('Updating form with PDF data:', pdfData);
      setFormData(pdfData);
    }
  }, [pdfData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      date: '',
      passNumber: '',
      cusdecNo: '',
      containerNo: '',
      destination: '',
      truckNumber: '',
      item: '',
      tokenNumber: '',
      status: 'IN',
      name: '',
      feet: '20 FEET'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passNumber">Pass Number</Label>
          <Input
            id="passNumber"
            required
            value={formData.passNumber}
            onChange={(e) => setFormData({ ...formData, passNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cusdecNo">CUSDEC No</Label>
          <Input
            id="cusdecNo"
            required
            value={formData.cusdecNo}
            onChange={(e) => setFormData({ ...formData, cusdecNo: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="containerNo">Container No</Label>
          <Input
            id="containerNo"
            required
            value={formData.containerNo}
            onChange={(e) => setFormData({ ...formData, containerNo: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            required
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="truckNumber">Truck Number</Label>
          <Input
            id="truckNumber"
            required
            value={formData.truckNumber}
            onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tokenNumber">Token Number</Label>
          <Input
            id="tokenNumber"
            required
            value={formData.tokenNumber}
            onChange={(e) => setFormData({ ...formData, tokenNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feet">Feet</Label>
          <RadioGroup
            value={formData.feet}
            onValueChange={(value) => setFormData({ ...formData, feet: value as '20 FEET' | '40 FEET' })}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="20 FEET" id="20feet" />
              <Label htmlFor="20feet">20 FEET</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="40 FEET" id="40feet" />
              <Label htmlFor="40feet">40 FEET</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item">Item</Label>
          <Input
            id="item"
            required
            value={formData.item}
            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <RadioGroup
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as 'IN' | 'OUT' })}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="IN" id="in" />
              <Label htmlFor="in">IN</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="OUT" id="out" />
              <Label htmlFor="out">OUT</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" className="w-full">Add Entry</Button>
    </form>
  );
};

export default DataEntryForm;
