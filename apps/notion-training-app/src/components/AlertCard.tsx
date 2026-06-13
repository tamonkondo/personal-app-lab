import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertAction,
} from "@repo/ui/components/ui/alert";
import { InfoIcon } from "@repo/ui/icons";
interface AlertCardProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}
const AlertCard = ({ title, message, action }: AlertCardProps) => {
  return (
    <Alert variant="destructive" className="w-full">
      <InfoIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {action && <AlertAction className="m-auto mt-3">{action}</AlertAction>}
    </Alert>
  );
};

export default AlertCard;
