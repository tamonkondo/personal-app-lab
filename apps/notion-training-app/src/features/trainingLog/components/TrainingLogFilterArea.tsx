import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  // MultipleSelector,
  Calendar,
  Button,
  // Option,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui";

import { ChevronDownIcon } from "@repo/ui/icons";
import { formatDate } from "@repo/utils";
import { useTrainingLogParams } from "../hooks/useTrainingLogParams";
// const OPTIONS: Option[] = [
//   { label: "全身", value: "theWholeBody" },
//   { label: "胸", value: "chest" },
//   { label: "上腕二頭筋", value: "biceps" },
//   { label: "上腕三頭筋", value: "triceps" },
//   { label: "ハムストリングス", value: "hamstrings" },
//   { label: "肩", value: "shoulder" },
//   { label: "大腿四頭筋", value: "quadricepsFemoris" },
//   { label: "腹筋", value: "abs" },
//   { label: "脊柱", value: "spine" },
//   { label: "臀部", value: "buttocks" },
// ];
const TrainingLogFilterArea = () => {
  // クエリパラメータの取得

  const { tlSort, tlStartDate, tlEndDate, setSearchParamsWithReset } =
    useTrainingLogParams();
  function handleReset() {
    setSearchParamsWithReset({
      tlSort: null,
      tlStartDate: null,
      tlEndDate: null,
    });
  }

  return (
    <div className="flex gap-4 flex-wrap mb-4 items-end">
      <div className="">
        <p>Sort Schedule</p>
        <div className="flex gap-4 mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!tlStartDate}
                className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {tlStartDate ? (
                  formatDate(new Date(tlStartDate))
                ) : (
                  <span>Pick a date</span>
                )}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                defaultMonth={tlStartDate ? new Date(tlStartDate) : new Date()}
                selected={tlStartDate ? new Date(tlStartDate) : undefined}
                onSelect={(date) => {
                  // クエリパラメータに反映
                  setSearchParamsWithReset({
                    tlStartDate: date ? formatDate(date, "hyphen") : null,
                  });
                }}
                disabled={(date) => {
                  if (!tlEndDate) return false;
                  return date > new Date(tlEndDate);
                }}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!tlEndDate}
                className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {tlEndDate ? (
                  formatDate(new Date(tlEndDate))
                ) : (
                  <span>Pick a date</span>
                )}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                defaultMonth={tlEndDate ? new Date(tlEndDate) : new Date()}
                selected={tlEndDate ? new Date(tlEndDate) : undefined}
                onSelect={(date) => {
                  // クエリパラメータに反映
                  setSearchParamsWithReset({
                    tlEndDate: date ? formatDate(date, "hyphen") : null,
                  });
                }}
                disabled={(date) => {
                  if (!tlStartDate) return false;
                  return date < new Date(tlStartDate);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {/* <div className="">
        <p>Sort Parts</p>
        <div className="flex gap-4 mt-2">
          <MultipleSelector
            options={OPTIONS}
            onChange={(selected) =>
              setParts((selected as Option[]).map((option) => option.value))
            }
          />
        </div>
      </div> */}
      <div className="">
        <p>Sort</p>
        <Select
          value={tlSort || ""}
          onValueChange={(value) => {
            setSearchParamsWithReset({
              tlSort: value,
            });
          }}
        >
          <SelectTrigger className="w-53 mt-2 justify-between">
            <SelectValue placeholder="Select a Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-full">
        <Button className=" mt-auto" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default TrainingLogFilterArea;
