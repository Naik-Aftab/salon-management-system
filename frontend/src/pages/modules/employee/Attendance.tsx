import type { ReactNode } from "react";

interface AttendanceTabProps {
  children: ReactNode;
}

export default function AttendanceTab({ children }: AttendanceTabProps) {
  return <>{children}</>;
}
