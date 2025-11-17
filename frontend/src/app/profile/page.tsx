'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile, ProfileUpdatePayload, User } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

interface FormState {
  name: string;
  username: string;
  bio: string;
  location: string;
  websiteUrl: string;
  twitterHandle: string;
}

const defaultForm: FormState = {
  name: '',
  username: '',
  bio: '',
  location: '',
  websiteUrl: '',
  twitterHandle: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [initialData, setInitialData] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    setLoadingProfile(true);
    getProfile()
      .then(profile => {
        if (!isMounted) return;
        setInitialData(profile);
        setForm({
          name: profile.name ?? '',
          username: profile.username ?? '',
          bio: profile.bio ?? '',
          location: profile.location ?? '',
          websiteUrl: profile.websiteUrl ?? '',
          twitterHandle: profile.twitterHandle ?? '',
        });
        setAvatarPreview(profile.avatarUrl ?? null);
        setAvatarDirty(false);
      })
      .catch(error => {
        console.error(error);
        toast.error('Failed to load profile');
      })
      .finally(() => {
        if (isMounted) {
          setLoadingProfile(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Avatar must be smaller than 1.5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setAvatarDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarDirty(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      avatarDirty ||
      form.name !== (initialData.name ?? '') ||
      form.username !== (initialData.username ?? '') ||
      form.bio !== (initialData.bio ?? '') ||
      form.location !== (initialData.location ?? '') ||
      form.websiteUrl !== (initialData.websiteUrl ?? '') ||
      form.twitterHandle !== (initialData.twitterHandle ?? '')
    );
  }, [avatarDirty, form, initialData]);

  const buildPayload = (): ProfileUpdatePayload | null => {
    if (!initialData) return null;
    const payload: ProfileUpdatePayload = {};

    if (form.name !== initialData.name) payload.name = form.name;
    if ((form.username || '') !== (initialData.username || '')) payload.username = form.username;
    if ((form.bio || '') !== (initialData.bio || '')) payload.bio = form.bio;
    if ((form.location || '') !== (initialData.location || '')) payload.location = form.location;
    if ((form.websiteUrl || '') !== (initialData.websiteUrl || '')) payload.websiteUrl = form.websiteUrl;
    if ((form.twitterHandle || '') !== (initialData.twitterHandle || ''))
      payload.twitterHandle = form.twitterHandle;
    if (avatarDirty) payload.avatarData = avatarPreview ?? '';

    if (Object.keys(payload).length === 0) {
      return null;
    }

    return payload;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!initialData) return;
    const payload = buildPayload();
    if (!payload) {
      toast('No changes to save');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile(payload);
      setInitialData(updated);
      setForm({
        name: updated.name ?? '',
        username: updated.username ?? '',
        bio: updated.bio ?? '',
        location: updated.location ?? '',
        websiteUrl: updated.websiteUrl ?? '',
        twitterHandle: updated.twitterHandle ?? '',
      });
      setAvatarPreview(updated.avatarUrl ?? null);
      setAvatarDirty(false);
      await refreshUser();
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">Profile</h1>
        <p className="text-sm text-slate-400">Update how the community sees you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Upload a square image for best results (max 1.5MB).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24 bg-gradient-to-br from-purple-500 to-violet-700">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt={form.name || user?.name || 'User avatar'} />
              ) : (
                <AvatarFallback className="text-lg text-white">
                  {(form.name || user?.name || 'U')
                    .split(' ')
                    .map(part => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-purple-500/40 text-purple-200 hover:bg-purple-500/10"
                >
                  Upload new
                </Button>
                {avatarPreview && (
                  <Button type="button" variant="ghost" onClick={removeAvatar} className="text-slate-400 hover:text-red-400">
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile information</CardTitle>
            <CardDescription>Share a little more about yourself.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={event => updateField('name', event.target.value)}
                  placeholder="Your display name"
                  required
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={event => updateField('username', event.target.value)}
                  placeholder="e.g. mik_student"
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
                <p className="text-xs text-slate-500">3-24 chars, letters, numbers, dots, underscores, hyphens.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ''}
                disabled
                className="bg-slate-800/30 border-slate-700 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={event => updateField('bio', event.target.value)}
                placeholder="Tell the community what you're working on (max 280 chars)"
                rows={4}
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
              />
              <p className="text-xs text-slate-500">{form.bio.length}/280</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={event => updateField('location', event.target.value)}
                  placeholder="City, Country"
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={form.websiteUrl}
                  onChange={event => updateField('websiteUrl', event.target.value)}
                  placeholder="https://"
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                value={form.twitterHandle}
                onChange={event => updateField('twitterHandle', event.target.value)}
                placeholder="@codestorywithmik"
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={saving || !isDirty}
            onClick={() => {
              if (!initialData) return;
              setForm({
                name: initialData.name ?? '',
                username: initialData.username ?? '',
                bio: initialData.bio ?? '',
                location: initialData.location ?? '',
                websiteUrl: initialData.websiteUrl ?? '',
                twitterHandle: initialData.twitterHandle ?? '',
              });
              setAvatarPreview(initialData.avatarUrl ?? null);
              setAvatarDirty(false);
              toast('Changes reverted');
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={saving || !isDirty}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

