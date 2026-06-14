import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import React from "react";

interface Props {
  title: string;
  description: string;
  content: React.ReactNode;
}

const TabContent = ({ title, description, content }: Props) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-2 text-sm text-zinc-500">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">{content}</CardContent>
    </Card>
  );
};

export default TabContent;
