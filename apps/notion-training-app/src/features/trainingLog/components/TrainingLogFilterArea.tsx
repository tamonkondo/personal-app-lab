import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  MultipleSelector,
  Calendar,
  Button,
  Option,
} from "@repo/ui";

import { ChevronDownIcon } from "@repo/ui/icons";
import { formatDate } from "@repo/utils";
import useTrainingFilterStore from "../store/useTrainingFilterStore";

const TrainingLogFilterArea = () => {
  // zustand呼び出し
  const startDate = useTrainingFilterStore((state) => state.startDate);
  const endDate = useTrainingFilterStore((state) => state.endDate);
  const setStartDate = useTrainingFilterStore((state) => state.setStartDate);
  const setEndDate = useTrainingFilterStore((state) => state.setEndDate);
  const OPTIONS: Option[] = [
    { label: "nextjs", value: "nextjs" },
    { label: "React", value: "react" },
    { label: "Remix", value: "remix" },
    { label: "Vite", value: "vite" },
    { label: "Nuxt", value: "nuxt" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Angular", value: "angular" },
    { label: "Ember", value: "ember", disable: true },
    { label: "Gatsby", value: "gatsby", disable: true },
    { label: "Astro", value: "astro" },
  ];

  return (
    <div className="flex gap-4 flex-wrap mb-4">
      <div className="">
        <p>Sort Schedule</p>
        <div className="flex gap-4 mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!startDate}
                className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {startDate ? formatDate(startDate) : <span>Pick a date</span>}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                defaultMonth={startDate || new Date()}
                selected={startDate}
                onSelect={setStartDate}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!endDate}
                className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {endDate ? formatDate(endDate) : <span>Pick a date</span>}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                defaultMonth={endDate || new Date()}
                selected={endDate}
                onSelect={setEndDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="">
        <p>Sort Parts</p>
        <div className="flex gap-4 mt-2">
          <MultipleSelector options={OPTIONS} />
        </div>
      </div>
    </div>
  );
};

export default TrainingLogFilterArea;
