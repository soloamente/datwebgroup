import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Chart06() {
  return (
    <Card className="gap-5">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Statistiche Archivio Digitale</CardTitle>
            <div className="flex items-start gap-2">
              <div className="text-2xl font-semibold">26.864</div>
              <Badge className="mt-1.5 border-none bg-emerald-500/24 text-emerald-500">
                +3,4%
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="bg-chart-4 size-2 shrink-0 rounded-full"
              ></div>
              <div className="text-muted-foreground/50 text-[13px]/3">
                Personale
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="bg-chart-1 size-2 shrink-0 rounded-full"
              ></div>
              <div className="text-muted-foreground/50 text-[13px]/3">
                Ufficio
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="bg-chart-5 size-2 shrink-0 rounded-full"
              ></div>
              <div className="text-muted-foreground/50 text-[13px]/3">
                Archivio
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex h-5 gap-1">
          <div className="bg-chart-4 h-full" style={{ width: "22%" }}></div>
          <div
            className="from-chart-2 to-chart-1 h-full bg-linear-to-r"
            style={{ width: "24%" }}
          ></div>
          <div className="bg-chart-5 h-full" style={{ width: "16%" }}></div>
          <div className="bg-chart-3 h-full" style={{ width: "38%" }}></div>
        </div>
        <div>
          <div className="text-muted-foreground/50 mb-3 text-[13px]/3">
            Tipologia di documenti
          </div>
          <ul className="divide-border divide-y text-sm">
            <li className="flex items-center gap-2 py-2">
              <span
                className="bg-chart-4 size-2 shrink-0 rounded-full"
                aria-hidden="true"
              ></span>
              <span className="text-muted-foreground grow">
                Fatture e ricevute fiscali
              </span>
              <span className="text-foreground/70 text-[13px]/3 font-medium">
                4.279
              </span>
            </li>
            <li className="flex items-center gap-2 py-2">
              <span
                className="from-chart-2 to-chart-1 size-2 shrink-0 rounded-full bg-linear-to-r"
                aria-hidden="true"
              ></span>
              <span className="text-muted-foreground grow">
                Documenti di identità e contratti
              </span>
              <span className="text-foreground/70 text-[13px]/3 font-medium">
                4.827
              </span>
            </li>
            <li className="flex items-center gap-2 py-2">
              <span
                className="bg-chart-5 size-2 shrink-0 rounded-full"
                aria-hidden="true"
              ></span>
              <span className="text-muted-foreground grow">
                Archivi storici e documentazione
              </span>
              <span className="text-foreground/70 text-[13px]/3 font-medium">
                3.556
              </span>
            </li>
            <li className="flex items-center gap-2 py-2">
              <span
                className="bg-chart-3 size-2 shrink-0 rounded-full"
                aria-hidden="true"
              ></span>
              <span className="text-muted-foreground grow">
                Corrispondenza e modulistica
              </span>
              <span className="text-foreground/70 text-[13px]/3 font-medium">
                6.987
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
