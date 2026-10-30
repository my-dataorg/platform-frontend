"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Mail, Store, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { federatedSignOut } from "@/lib/auth-actions";
import { userDisplayName, userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type Props = {
  name?: string | null;
  email?: string | null;
  shell?: boolean;
};

export function UserMenu({ name, email, shell }: Props) {
  const displayName = userDisplayName(name, email);
  const initials = userInitials(name, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={shell ? "ghost" : "outline"}
          className={cn(
            "h-auto gap-2 rounded-xl px-2 py-1.5",
            shell &&
              "gap-0 rounded-md px-1 py-0.5 sm:gap-2 sm:rounded-xl sm:px-2 sm:py-1.5 border border-white/15 bg-white/10 text-shell-foreground hover:bg-white/15 hover:text-shell-foreground"
          )}
        >
          <Avatar className={cn("h-8 w-8", shell && "h-7 w-7 sm:h-8 sm:w-8")}>
            <AvatarFallback
              className={cn(
                shell && "bg-primary text-primary-foreground ring-0 text-xs sm:text-sm"
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate font-medium sm:inline">{displayName}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4",
              shell ? "hidden text-shell-muted sm:block" : "text-muted-foreground"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">{displayName}</p>
          {email && <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound />
            Edit profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/marketplace">
            <Store />
            Marketplace
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/emails">
            <Mail />
            Inbox
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-1">
          <form action={federatedSignOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Sign out
            </button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
