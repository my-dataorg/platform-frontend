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

type Props = {
  name?: string | null;
  email?: string | null;
};

export function UserMenu({ name, email }: Props) {
  const displayName = userDisplayName(name, email);
  const initials = userInitials(name, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-auto gap-2 rounded-xl px-2 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate font-medium sm:inline">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
        <DropdownMenuItem asChild>
          <form action={federatedSignOut} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut />
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
