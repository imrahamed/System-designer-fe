import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { DesignPanel } from './DesignPanel';
import { CreatePanel } from './CreatePanel';

export function RightSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Design</SidebarGroupLabel>
          <DesignPanel />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <CreatePanel />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
