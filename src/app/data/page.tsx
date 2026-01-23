'use client'

import {api} from '@convex/_generated/api'
import {getTimeAgo} from '@/lib/utils'

import {useQuery} from 'convex/react'

import {Tabs, TabsContent, TabsList, TabsTrigger} from '~/ui/tabs'
import {Card, CardContent} from '~/ui/card'
import {Avatar, AvatarFallback, AvatarImage} from '~/ui/avatar'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '~/ui/table'
import {Badge} from '~/ui/badge'
import {Skeleton} from '~/ui/skeleton'
import {Spinner} from '~/ui/spinner'
import {H1} from '~/ui/typography'

function LoadingSkeleton() {
  return (
    <Skeleton className="h-[40vh] grid place-items-center">
      <Spinner className="size-4" />
    </Skeleton>
  )
}

export default function DataPage() {
  const users = useQuery(api.tables.users.getAllUsers)
  const communities = useQuery(api.tables.communities.getAllCommunities)
  const stats = useQuery(api.tables.stats.getAllStats)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <H1>Convex Database</H1>

      <Tabs defaultValue="stats" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">
            Stats{' '}
            <Badge variant="default" className="rounded-md">
              {stats?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="users">
            Users{' '}
            <Badge variant="default" className="rounded-md">
              {users?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="communities">
            Communities{' '}
            <Badge variant="default" className="rounded-md">
              {communities?.length || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardContent>
              {!users ? (
                <LoadingSkeleton />
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No users found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Avatar className="size-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">@{user.username}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.followersCount.toLocaleString()}</TableCell>
                        <TableCell>{user.requestCount}</TableCell>
                        <TableCell>{getTimeAgo(user.lastActivity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <Card>
            <CardContent>
              {!communities ? (
                <LoadingSkeleton />
              ) : communities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No communities found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Hashtag</TableHead>
                      <TableHead>Cashtag</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {communities.map((community) => (
                      <TableRow key={community._id}>
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={community.avatar} alt={community.name} />
                            <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{community.name}</TableCell>
                        <TableCell>@{community.username}</TableCell>
                        <TableCell className="font-mono text-sm">{community.slug}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{community.hashtag}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{community.cashtag}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={community.isActive ? 'default' : 'secondary'}>{community.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardContent>
              {!stats ? (
                <LoadingSkeleton />
              ) : stats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No stats found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Community</TableHead>
                      <TableHead>Tweets</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Engagement Rate</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.map((stat) => (
                      <TableRow key={stat._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={stat.user?.avatar} alt={stat.user?.name} />
                              <AvatarFallback className="text-xs">{stat.user?.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">@{stat.user?.username || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">{stat.user?.name || 'Unknown User'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={stat.community?.avatar} alt={stat.community?.name} />
                              <AvatarFallback className="text-xs">{stat.community?.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{stat.community?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">
                                @{stat.community?.username || 'unknown'} • {stat.community?.hashtag || '#unknown'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">{stat.raw.tweets}</TableCell>
                        <TableCell className="text-right font-mono">{stat.calculated.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">{stat.calculated.engagement.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{stat.calculated.engagementRate ? `${stat.calculated.engagementRate.toFixed(2)}%` : 'N/A'}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{getTimeAgo(stat._creationTime)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
