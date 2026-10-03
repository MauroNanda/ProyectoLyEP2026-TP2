import { useEffect } from "react";

// Protege cierre/recarga y enlaces internos; BrowserRouter no admite useBlocker.
export default function useUnsavedChanges(dirty) {
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onLink = (event) => {
      const link = event.target.closest("a[href]");
      if (
        !link ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        link.target === "_blank"
      )
        return;
      const destination = new URL(link.href, window.location.href);
      if (
        destination.pathname === window.location.pathname &&
        destination.origin === window.location.origin
      )
        return;
      if (
        !window.confirm("Hay datos sin guardar. ¿Querés salir y descartarlos?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onLink, true);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onLink, true);
    };
  }, [dirty]);
}
