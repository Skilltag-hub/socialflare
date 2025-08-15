"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/Button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import skillsJson from "@/technical_skills.json";

interface Skill {
  category: string;
  skills: string[];
}

interface SkillsComboboxProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}

export function SkillsCombobox({
  value,
  onChange,
  placeholder = "Select skills...",
}: SkillsComboboxProps) {
  const [open, setOpen] = useState(false);
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Load skills from JSON
  useEffect(() => {
    const data = Object.entries(
      (skillsJson as { technical_skills: Record<string, string[]> })
        .technical_skills
    ).map(([category, skills]) => ({ category, skills }));
    setSkillsData(data);
  }, []);

  // Flatten once; memoize to avoid re-renders that can affect focus
  const allSkills = useMemo(
    () =>
      skillsData.flatMap((category) =>
        category.skills.map((skill) => ({
          value: skill,
          label: skill,
          category: category.category,
        }))
      ),
    [skillsData]
  );

  const selectedSkills = useMemo(
    () => allSkills.filter((s) => value.includes(s.value)),
    [allSkills, value]
  );

  const toggleSkill = (skillValue: string) => {
    const newSkills = value.includes(skillValue)
      ? value.filter((v) => v !== skillValue)
      : [...value, skillValue];
    onChange(newSkills);
  };

  const removeSkill = (skillValue: string) => {
    onChange(value.filter((v) => v !== skillValue));
  };

  const SkillsList = () => (
    <Command>
      {/* Let cmdk handle filtering internally */}
      <CommandInput placeholder="Search skills..." />
      <CommandList className="max-h-[200px] overflow-auto">
        <CommandEmpty>No skills found.</CommandEmpty>

        {skillsData.map((category) => (
          <CommandGroup key={category.category} heading={category.category}>
            {category.skills.map((skill) => {
              const isSelected = value.includes(skill);
              return (
                <CommandItem
                  key={skill}
                  // include category in the value so searches match both
                  value={`${skill} ${category.category}`}
                  onSelect={() => toggleSkill(skill)}
                  className="flex items-center justify-between"
                >
                  <span>{skill}</span>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );

  const TriggerContent = () => (
    <div className="flex flex-wrap gap-2 items-center min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
      {selectedSkills.length > 0 ? (
        selectedSkills.map((skill) => (
          <Badge
            key={skill.value}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {skill.label}
            <X
              className="w-3 h-3 cursor-pointer ml-1"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill.value);
              }}
            />
          </Badge>
        ))
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
      <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
    </div>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start p-0 h-auto"
          >
            <TriggerContent />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <SkillsList />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start p-0 h-auto">
          <TriggerContent />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t p-4">
          <SkillsList />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
