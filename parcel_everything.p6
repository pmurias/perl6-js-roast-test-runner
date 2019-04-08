for @*ARGS -> $file {
  next if $file ~~ /S01\-perl/;

  my $out = $file.IO.dirname.IO.basename ~ '___' ~ $file.IO.basename.subst('.t', '.js');
  if 'dist'.IO.add($out) ~~ :e {
    say "skipping $out";
  } else {
    %*ENV<PARCEL_WORKERS> = 1;
    my $command = "node --max-old-space-size=8192 --stack-size=3000 ./node_modules/.bin/parcel build --out-file $out $file";
    say $command;
    shell($command);
  }
}
