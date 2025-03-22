"use client";

import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import * as React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Toggle
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Toggle>
  );
}

export default function NavigationMenuDemo() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSmallScreen, setIsSmallScreen] = React.useState(false); // State for screen size

  // Use useEffect to check screen size on mount and on resize
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640); // sm breakpoint in Tailwind
    };

    checkScreenSize(); // Check on initial load

    window.addEventListener("resize", checkScreenSize); // Add event listener

    return () => window.removeEventListener("resize", checkScreenSize); // Cleanup
  }, []);

  return (
    <>
      {isSmallScreen ? (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full" // Full width on small screens
        >
          <div className="flex items-center justify-between px-4 py-2">
            <h4 className="text-sm font-semibold">Pradhyuman</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <HamburgerMenuIcon className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2 p-4">
            {/* Menu Items (Links) -  Use regular Links within CollapsibleContent */}
            <Link href="/" passHref>
              <div className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                Thoughts
              </div>
            </Link>
            <Link href="/resume" passHref>
              <div className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                Resume
              </div>
            </Link>
            <Link href="/projects" passHref>
              <div className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                Projects
              </div>
            </Link>
            <Link href="https://github.com/pradhyuman-yadav" passHref>
              <div className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                Github
              </div>
            </Link>
            <Link href="https://www.linkedin.com/in/pradhyuman-yadav/" passHref>
              <div className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                Linkedin
              </div>
            </Link>
            <Link href="/tools" passHref>
              <div className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                Tools
              </div>
            </Link>
            <Link href="/train-sim" passHref>
              <div className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                Train Sim
              </div>
            </Link>
            <ModeToggle />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <NavigationMenu>
          <NavigationMenuList>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Thoughts
              </NavigationMenuLink>
            </Link>
            <Link href="/resume" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Resume
              </NavigationMenuLink>
            </Link>
            <Link href="/projects" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Projects
              </NavigationMenuLink>
            </Link>
            <Link
              href="https://github.com/pradhyuman-yadav"
              legacyBehavior
              passHref
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Github
              </NavigationMenuLink>
            </Link>
            <Link
              href="https://www.linkedin.com/in/pradhyuman-yadav/"
              legacyBehavior
              passHref
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Linkedin
              </NavigationMenuLink>
            </Link>
            <Link href="/tools" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Tools
              </NavigationMenuLink>
            </Link>
            <Link href="/train-sim" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Train Sim
              </NavigationMenuLink>
            </Link>
            <Link href="/law-advisor" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Law
              </NavigationMenuLink>
            </Link>
            <Link href="/health-center" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Health Center
              </NavigationMenuLink>
            </Link>
            <NavigationMenuItem>
              <ModeToggle />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}
    </>
  );
}
