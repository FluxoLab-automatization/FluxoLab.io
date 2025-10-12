import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UserProfile from '../UserProfile.vue';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    displayName: 'João Silva',
    avatarColor: '#6366f1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-01-01T00:00:00.000Z',
  };

  it('renders user information correctly', () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser },
    });

    expect(wrapper.text()).toContain('João Silva');
    expect(wrapper.text()).toContain('test@example.com');
  });

  it('displays user initials when no avatar is provided', () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser },
    });

    const initials = wrapper.find('.user-initials');
    expect(initials.text()).toBe('JS');
  });

  it('handles missing displayName gracefully', () => {
    const userWithoutName = {
      ...mockUser,
      displayName: '',
    };

    const wrapper = mount(UserProfile, {
      props: { user: userWithoutName },
    });

    const initials = wrapper.find('.user-initials');
    expect(initials.text()).toBe('TE'); // First two letters of email
  });

  it('formats last login date correctly', () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser },
    });

    // Check if the date is formatted and displayed
    expect(wrapper.text()).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('emits logout event when logout button is clicked', async () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser },
    });

    const logoutButton = wrapper.find('[data-testid="logout-button"]');
    await logoutButton.trigger('click');

    expect(wrapper.emitted('logout')).toBeTruthy();
    expect(wrapper.emitted('logout')).toHaveLength(1);
  });

  it('shows loading state when user is null', () => {
    const wrapper = mount(UserProfile, {
      props: { user: null },
    });

    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);
  });

  it('applies correct CSS classes based on user status', () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser },
    });

    const profileContainer = wrapper.find('.user-profile');
    expect(profileContainer.classes()).toContain('user-profile--authenticated');
  });

  it('displays user role if provided', () => {
    const userWithRole = {
      ...mockUser,
      role: 'admin',
    };

    const wrapper = mount(UserProfile, {
      props: { user: userWithRole },
    });

    expect(wrapper.text()).toContain('admin');
  });
});
