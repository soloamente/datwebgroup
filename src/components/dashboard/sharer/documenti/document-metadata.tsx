"use client";

import { type MyDocumentClass, type MyDocumentClassField } from "@/app/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/kamui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentMetadataProps {
  documentClasses: MyDocumentClass[];
  selectedDocClassId: string;
  onDocClassChange: (classId: string) => void;
  metadata: Record<string, string | number | boolean>;
  onMetadataChange: (
    fieldName: string,
    value: string | number | boolean,
  ) => void;
  isLoading: boolean;
  selectedDocClass: MyDocumentClass | undefined;
}

export function DocumentMetadata({
  documentClasses,
  selectedDocClassId,
  onDocClassChange,
  metadata,
  onMetadataChange,
  isLoading,
  selectedDocClass,
}: DocumentMetadataProps) {
  const renderField = (field: MyDocumentClassField) => {
    const value = metadata[field.name];

    switch (field.data_type) {
      case "string":
        return (
          <Input
            id={field.name}
            type="text"
            placeholder={`Inserisci ${field.label.toLowerCase()}`}
            value={(value as string) ?? ""}
            onChange={(e) => onMetadataChange(field.name, e.target.value)}
            className="bg-background"
            required={!!field.required}
          />
        );
      case "integer":
      case "decimal":
        return (
          <Input
            id={field.name}
            type="number"
            placeholder={`Inserisci ${field.label.toLowerCase()}`}
            value={(value as number) ?? ""}
            onChange={(e) => onMetadataChange(field.name, e.target.value)}
            className="bg-background"
            required={!!field.required}
          />
        );
      case "date":
        return (
          <Input
            id={field.name}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onMetadataChange(field.name, e.target.value)}
            className="bg-background"
            required={!!field.required}
          />
        );
      case "datetime":
        return (
          <Input
            id={field.name}
            type="datetime-local"
            value={(value as string) ?? ""}
            onChange={(e) => onMetadataChange(field.name, e.target.value)}
            className="bg-background"
            required={!!field.required}
          />
        );
      case "boolean":
        return (
          <div className="border-input bg-background flex h-10 items-center space-x-2 rounded-md border px-3">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) =>
                onMetadataChange(field.name, checked)
              }
            />
            <label
              htmlFor={field.name}
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        );
      case "enum":
        return (
          <Select
            onValueChange={(selectValue) =>
              onMetadataChange(field.name, selectValue)
            }
            value={(value as string) ?? ""}
            required={!!field.required}
          >
            <SelectTrigger id={field.name}>
              <SelectValue
                placeholder={`Seleziona ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default: {
        const _exhaustiveCheck: never = field.data_type;
        return <p>Unsupported field type: {field.data_type}</p>;
      }
    }
  };

  const renderMetadataFields = () => {
    if (!selectedDocClass) return null;

    return (
      <div className="grid grid-cols-1 gap-4">
        {selectedDocClass.fields
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((field) => (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required ? (
                  <span className="text-destructive">*</span>
                ) : (
                  ""
                )}
              </Label>
              {renderField(field)}
            </div>
          ))}
      </div>
    );
  };

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle>Dettagli Documento</CardTitle>
        <CardDescription>
          Seleziona una classe e compila i metadati richiesti.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-6">
        <div className="grid w-full gap-2">
          <Label htmlFor="doc-class">Classe Documentale</Label>
          <Select onValueChange={onDocClassChange} value={selectedDocClassId}>
            <SelectTrigger id="doc-class">
              <SelectValue placeholder="Seleziona una classe..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Caricamento...
                </SelectItem>
              ) : (
                documentClasses.map((dc) => (
                  <SelectItem key={dc.id} value={dc.id.toString()}>
                    {dc.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        {selectedDocClass ? (
          <ScrollArea className="flex-1">
            <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
              <h4 className="text-foreground font-semibold">
                Metadati per {selectedDocClass.name}
              </h4>
              {renderMetadataFields()}
            </div>
          </ScrollArea>
        ) : (
          <div className="border-border bg-muted/50 text-muted-foreground flex h-full flex-1 items-center justify-center rounded-lg border-2 border-dashed text-center text-sm">
            Seleziona una classe documentale
            <br />
            per compilare i metadati.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
