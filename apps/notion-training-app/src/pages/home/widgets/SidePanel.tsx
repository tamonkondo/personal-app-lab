import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const SidePanel = ({ children }: Props) => {
  return <aside className="flex flex-col gap-6 xl:mt-14">{children}</aside>;
};

export default SidePanel;
