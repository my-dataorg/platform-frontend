"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Mail, Store } from "lucide-react";
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
            shell && "border border-white/15 bg-white/10 text-shell-foreground hover:bg-white/15 hover:text-shell-foreground"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className={shell ? "bg-primary text-primary-foreground ring-0" : undefined}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate font-medium sm:inline">{displayName}</span>
          <ChevronDown className={cn("h-4 w-4", shell ? "text-shell-muted" : "text-muted-foreground")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">{displayName}</p>
          {email && <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
