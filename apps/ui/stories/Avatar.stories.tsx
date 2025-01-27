import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback, AvatarImage } from "@kampus/ui-next/components/avatar";

const meta = {
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/kamp-us.png" alt="@kampus" />
      <AvatarFallback>K</AvatarFallback>
    </Avatar>
  ),
} satisfies Story;
