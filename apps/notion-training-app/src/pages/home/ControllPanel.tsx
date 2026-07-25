import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Link } from "react-router-dom";
const ControllPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Link to="/training-logs/new" viewTransition>
          <Button className="w-full">New Training Record</Button>
        </Link>
        <Link to="/exercises/new" viewTransition>
          <Button variant="outline" className="w-full">
            New Training Exercise
          </Button>
        </Link>
        <Link to="/goal-weights/new" viewTransition>
          <Button variant="outline" className="w-full">
            New Goal Weight of Exercise
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ControllPanel;
