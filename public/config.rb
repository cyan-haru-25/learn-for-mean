require 'compass/import-once/activate'
require 'bootstrap-sass'
# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
environment = :development  #開発中
#environment = :production #本番
http_path = "/"
# 以下の記述でコンパス実行フォルダ全部を監視
css_dir = "/"
sass_dir = "/"
images_dir = "img"
javascripts_dir = "js"
relative_assets = true
output_style = (environment == :production) ? :compressed : :expanded
# debug_infoはどうゆう訳か認識されない
#sass_options = { :debug_info => (environment == :production) ? false : true }
sourcemap = (environment == :production) ? false : true

#autoprefixerの設定【sourcemapが効かなくなるので、開発中はコメントアウト】
# require 'autoprefixer-rails'

# on_stylesheet_saved do |file|
#   css = File.read(file)
#   File.open(file, 'w') do |io|
#     io << AutoprefixerRails.process(css)
#   end
# end

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
