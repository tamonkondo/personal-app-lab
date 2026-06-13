interface AlertCardProps {
  title: string;
  message: string;
}
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
const AlertCard = ({ title, message }: AlertCardProps) => {
  return (
    <Alert variant="destructive" className="w-full">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default AlertCard;
