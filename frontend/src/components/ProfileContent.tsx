'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getProfile,
  updateProfile,
  ProfileUpdatePayload,
  User,
} from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import { toast } from 'sonner';
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from './ui/image-crop';
import { XIcon } from 'lucide-react';

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

export function ProfileContent() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [initialData, setInitialData] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

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
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Avatar must be smaller than 1.5MB');
      return;
    }
    setSelectedFile(file);
    setCroppedImage(null);
  };

  const handleCropComplete = (croppedImageData: string) => {
    setCroppedImage(croppedImageData);
    setAvatarPreview(croppedImageData);
    setAvatarDirty(true);
  };

  const handleResetCrop = () => {
    setSelectedFile(null);
    setCroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChooseDifferent = () => {
    setSelectedFile(null);
    setCroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleSaveCroppedAvatar = async () => {
    if (!croppedImage || !initialData) return;
    
    setSaving(true);
    try {
      const payload: ProfileUpdatePayload = {
        avatarData: croppedImage,
      };
      const updated = await updateProfile(payload);
      setInitialData(updated);
      setAvatarPreview(updated.avatarUrl ?? null);
      setAvatarDirty(false);
      setSelectedFile(null);
      setCroppedImage(null);
      await refreshUser();
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCroppedAvatar = () => {
    setSelectedFile(null);
    setCroppedImage(null);
    setAvatarPreview(null);
    setAvatarDirty(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarDirty(true);
    setSelectedFile(null);
    setCroppedImage(null);
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
    if ((form.username || '') !== (initialData.username || ''))
      payload.username = form.username;
    if ((form.bio || '') !== (initialData.bio || '')) payload.bio = form.bio;
    if ((form.location || '') !== (initialData.location || ''))
      payload.location = form.location;
    if ((form.websiteUrl || '') !== (initialData.websiteUrl || ''))
      payload.websiteUrl = form.websiteUrl;
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

  if (loadingProfile) {
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
    <>
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animated-gradient-border {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
        <div>
          <p className="text-sm text-slate-400">
            Let&rsquo;s update how the community sees you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`relative overflow-hidden rounded-xl p-0.5 animated-gradient-border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-500 to-blue-400'
                : 'bg-gradient-to-br from-purple-300 to-blue-300'
            }`}
            style={{
              background:
                theme === 'dark'
                  ? 'linear-gradient(45deg, #9333ea, #3b82f6, #9333ea)'
                  : 'linear-gradient(45deg, #c084fc, #60a5fa, #c084fc)',
            }}
          >
            <Card
              className={`border-0 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>
                  Upload an image and crop it to fit (max 1.5MB).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!selectedFile && !croppedImage && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-24 w-24 bg-gradient-to-br from-purple-500 to-violet-700">
                      {avatarPreview ? (
                        <AvatarImage
                          src={avatarPreview}
                          alt={form.name || user?.name || 'User avatar'}
                        />
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
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={removeAvatar}
                            className="text-slate-400 hover:text-red-400"
                          >
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
                  </div>
                )}

                {selectedFile && !croppedImage && (
                  <ImageCrop
                    aspect={1}
                    circularCrop
                    file={selectedFile}
                    maxImageSize={1.5 * 1024 * 1024}
                    onCrop={handleCropComplete}
                  >
                    <ImageCropContent className="max-w-md mx-auto" />
                    <div className="flex items-center gap-2 justify-center">
                      <ImageCropApply />
                      <ImageCropReset />
                      <Button
                        onClick={handleResetCrop}
                        type="button"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-400"
                      >
                        Cancel
                      </Button>
                    </div>
                  </ImageCrop>
                )}

                {croppedImage && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Avatar className="h-24 w-24 bg-gradient-to-br from-purple-500 to-violet-700">
                        <AvatarImage
                          src={croppedImage}
                          alt="Cropped avatar preview"
                        />
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-slate-400">
                          Cropped image ready. Save changes to update your profile.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleChooseDifferent}
                        disabled={saving}
                        className="border-purple-500/40 text-purple-200 hover:bg-purple-500/10"
                      >
                        Choose different
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveCroppedAvatar}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemoveCroppedAvatar}
                        disabled={saving}
                        className="text-slate-400 hover:text-red-400"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
              <CardDescription>
                Share a little more about yourself.
              </CardDescription>
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
                    onChange={event =>
                      updateField('username', event.target.value)
                    }
                    placeholder="e.g. mik_student"
                    className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                  />
                  <p className="text-xs text-slate-500">
                    3-24 chars, letters, numbers, dots, underscores, hyphens.
                  </p>
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
                    onChange={event =>
                      updateField('location', event.target.value)
                    }
                    placeholder="City, Country"
                    className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={form.websiteUrl}
                    onChange={event =>
                      updateField('websiteUrl', event.target.value)
                    }
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
                  onChange={event =>
                    updateField('twitterHandle', event.target.value)
                  }
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
              className="border border-slate-700/70 bg-transparent text-slate-300 transition-all duration-200 cursor-pointer hover:border-slate-400 hover:bg-slate-800/60 hover:text-slate-50 hover:shadow-[0_0_0_1px_rgba(148,163,184,0.6)] hover:-translate-y-px disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-700/70 disabled:hover:text-slate-300"
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
            <Button
              type="submit"
              disabled={saving || !isDirty}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-0 bg-gradient-to-r from-purple-600 to-blue-500 p-[1.5px] shadow-sm transition-all duration-200 cursor-pointer hover:shadow-[0_18px_45px_rgba(139,92,246,0.55)] hover:-translate-y-[1.5px] disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              <span
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${
                  saving || !isDirty
                    ? 'bg-slate-950 text-slate-500'
                    : 'bg-slate-950 text-white group-hover:bg-transparent group-hover:dark:bg-transparent group-hover:text-white'
                }`}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
