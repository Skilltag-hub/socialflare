import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BarChart3, Bookmark, User, Home, Clock, Zap } from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Post a Job button */}
      <div className="flex justify-end p-6">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-1.5 rounded-lg text-sm">
          Post a Job
        </Button>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 pl-12 pr-6 py-6 flex flex-col h-screen">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center transform -rotate-12">
              <Zap className="w-5 h-5 text-white transform rotate-12" />
            </div>
            <span className="text-xl font-bold">zigwork</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-auto">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-600/30">
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Home</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium text-sm">My Zigs</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
              <Bookmark className="w-4 h-4" />
              <span className="font-medium text-sm">Shortlist</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">Profile</span>
            </div>
          </nav>

          {/* Footer Links */}
          <div className="space-y-2 text-xs text-gray-400 px-3">
            <div className="hover:text-white cursor-pointer transition-colors">Support</div>
            <div className="hover:text-white cursor-pointer transition-colors">Privacy Policy</div>
            <div className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</div>
            <div className="text-xs mt-4 text-gray-500">©All Rights Reserved Zigwork</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 pr-0">
          {/* Stats Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 max-w-xl">
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 mb-0.5">12</div>
                    <div className="text-gray-600 font-medium text-sm">Active Gigs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 mb-0.5">100</div>
                    <div className="text-gray-600 font-medium text-sm">All Gigs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 mb-0.5">100</div>
                    <div className="text-gray-600 font-medium text-sm">Shortlisted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 mb-0.5">100</div>
                    <div className="text-gray-600 font-medium text-sm">Applied</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Post Ideas Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Post Ideas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl">
              {/* Create First Zig Card */}
              <Card className="bg-transparent border-2 border-dashed border-gray-600 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-3 transform -rotate-12">
                    <Zap className="w-6 h-6 text-white transform rotate-12" />
                  </div>
                  <div className="text-gray-400 font-medium text-sm">+ Post your first Zig</div>
                </CardContent>
              </Card>

              {/* UGC Videos Card 1 */}
              <Card className="bg-white text-black rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800 leading-relaxed text-sm">
                      Create <span className="font-bold text-black">UGC Videos</span> and get shares on Instagram about
                      Myntra Showbizz now.
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-600" />
                      <span>100 Applicants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>1d ago</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-lg">350</span>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-1.5 rounded-lg font-medium text-sm">
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* UGC Videos Card 2 */}
              <Card className="bg-white text-black rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800 leading-relaxed text-sm">
                      Create <span className="font-bold text-black">UGC Videos</span> and get shares on Instagram about
                      Myntra Showbizz now.
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-600" />
                      <span>100 Applicants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>1d ago</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-lg">350</span>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-1.5 rounded-lg font-medium text-sm">
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Notifications */}
        <div className="w-72 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-800 pb-4 last:border-b-0">
                  <div className="flex items-center gap-1 text-xs text-purple-400 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>1d ago</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Create <span className="font-bold text-white">UGC Videos</span> and get shares on Instagram about
                    Myntra Showbizz
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
