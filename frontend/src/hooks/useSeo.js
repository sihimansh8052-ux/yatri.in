import { useEffect } from "react";

export default function useSeo(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
