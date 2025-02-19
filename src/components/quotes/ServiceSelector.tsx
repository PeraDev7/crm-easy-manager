
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type Service = {
  id: string;
  description: string;
  unit_price: number;
};

interface ServiceSelectorProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

export function ServiceSelector({ services, onSelect }: ServiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && services
            ? services.find((service) => service.id === value)?.description
            : "Seleziona un servizio..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cerca servizio..." />
          <CommandEmpty>Nessun servizio trovato.</CommandEmpty>
          <CommandGroup>
            {services?.map((service) => (
              <CommandItem
                key={service.id}
                value={service.id}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  setOpen(false);
                  onSelect(service);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === service.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {service.description} - €{service.unit_price}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
